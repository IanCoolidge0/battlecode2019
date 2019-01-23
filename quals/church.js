import * as util from "./util.js"
import {SPECS} from 'battlecode';
import * as constants from "./constants.js";

import * as combat from "./combat.js";
import * as logging from "./logging.js";


function attempt_build(r, unit, dir) {
    let dir_coord = [dir, util.rotateLeft(dir,1), util.rotateRight(dir,1), util.rotateLeft(dir,2),
        util.rotateRight(dir,2), util.rotateLeft(dir,3), util.rotateRight(dir,3), util.rotateLeft(dir,4)];
    let vis_map = r.getVisibleRobotMap();

    for(let i=0;i<dir_coord.length;i++) {
        let newX = r.me.x + dir_coord[i].x;
        let newY = r.me.y + dir_coord[i].y;

        if(newX < 0 || newY < 0 || newX >= r.map.length || newY >= r.map.length)
            continue;

        if(r.map[newY][newX] && vis_map[newY][newX] === 0) {
            return r.buildUnit(unit, dir_coord[i].x, dir_coord[i].y);
        }
    }
}

function build_unit(r,unit_type,target_x,target_y,job) {
    r.currentAssignment = {unit: unit_type, x: target_x, y: target_y, code: job};
    r.signal(util.signalCoords(target_x, target_y, job), 2);
    logging.logBuiltUnit(r, unit_type, target_x, target_y, job);

    return attempt_build(r, unit_type,util.directionTo(target_x - r.me.x,target_y - r.me.y));
}

function init(r) {
    r.size = r.map.length;
    r.buildQueue = [];
    
    r.pilgrimQueue = [];
    r.preacherQueue = [];
    r.prophetQueue = [];
    r.crusaderQueue = [];
    let dir_coord = [{x:-1,y:-1}, {x:-1,y:0}, {x:-1,y:1}, {x:0,y:1}, {x:1,y:1}, {x:1,y:0}, {x:1,y:-1}, {x:0,y:-1}];
    r.unitMap = combat.unitMap(r);
    //r.log("UNITMAP_________________________________________")
    //r.log(r.unitMap);
    r.unitLocationQueue = combat.unitLocationsQueue(r,2,2,r.unitMap,true);

    r.builderJob = {};

    r.createdRobots = {};

    let visible = r.getVisibleRobots();
    for(let i=0;i<visible.length;i++) {
        let sig = util.decodeCoords(visible[i].signal);
        if(sig.code === 5) {
            r.builderJob = sig;

            r.createdRobots[visible[i].id] = {unit: SPECS.PILGRIM, x: sig.x, y: sig.y,
                code: r.karbonite_map[sig.y][sig.x] ? constants.PILGRIM_JOBS.MINE_KARBONITE : constants.PILGRIM_JOBS.MINE_FUEL};

            break;
        }
    }

    for(let i=-constants.CLUSTER_RADIUS;i<=constants.CLUSTER_RADIUS;i++) {
        for(let j=-constants.CLUSTER_RADIUS;j<=constants.CLUSTER_RADIUS;j++) {
            if(i ** 2 + j ** 2 > constants.CLUSTER_RADIUS ** 2) continue;
            let newX = r.me.x + i;
            let newY = r.me.y + j;

            if(util.withInMap({x: newX, y: newY}, r) && (newX !== r.builderJob.x || newY !== r.builderJob.y)) {
                if(r.fuel_map[newY][newX]) {
                    r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 25, fuel: 100});
                    r.pilgrimQueue.push({x: newX, y: newY, code: constants.PILGRIM_JOBS.MINE_FUEL});
                }

                if(r.karbonite_map[newY][newX]) {
                    r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 25, fuel: 100});
                    r.pilgrimQueue.push({x: newX, y: newY, code: constants.PILGRIM_JOBS.MINE_KARBONITE});
                }
            }
        }
    }

    for (let i=0;i<r.unitLocationQueue.length;i++) {
        r.buildQueue.push({unit: SPECS.PROPHET,karbonite:25, fuel: 200});
        r.prophetQueue.push({x:r.unitLocationQueue[i].x, y: r.unitLocationQueue[i].y, code: constants.PROPHET_JOBS.DEFEND_GOAL});
    }
}

function replaceDeadUnit(robot, r) {
    if(robot.unit === SPECS.PILGRIM) {
        if (robot.code === constants.PILGRIM_JOBS.MINE_KARBONITE) {
            r.buildQueue.unshift({unit: SPECS.PILGRIM, karbonite: 10, fuel: 200});
            r.pilgrimQueue.unshift({x: robot.x, y: robot.y, code: constants.PILGRIM_JOBS.MINE_KARBONITE});
        } else if (robot.code === constants.PILGRIM_JOBS.MINE_FUEL) {
            r.buildQueue.unshift({unit: SPECS.PILGRIM, karbonite: 10, fuel: 200});
            r.pilgrimQueue.unshift({x: robot.x, y: robot.y, code: constants.PILGRIM_JOBS.MINE_FUEL});
        }
    }
}

function step(r) {

    let visible = r.getVisibleRobots();

    //replace dead units and remove them from r.createdRobots
    let myRobots = Object.keys(r.createdRobots);
    let toRemove = [];
    for(let i=0;i<myRobots.length;i++) {
        let robot = r.createdRobots[myRobots[i]];
        let alive = false;

        for (let j = 0; j < visible.length; j++) {
            //DO NOT CHANGE THIS TO ===
            if (visible[j].id == myRobots[i])
                alive = true;
        }

        if (!alive) {
            r.log("replacing");
            replaceDeadUnit(robot, r);
            toRemove.push(myRobots[i]);
        }
    }
    for(let i=0;i<toRemove.length;i++) {
        delete r.createdRobots[toRemove[i]];
    }

    //assignment
    for(let i=0;i<visible.length;i++) {
        //r.log(visible);
        if(util.decodeCoords(visible[i].signal).code === constants.SIGNAL_CODE.INIT_SIGNAL && (visible[i].x - r.me.x) ** 2 + (visible[i].y - r.me.y) ** 2 <= 2) {
            r.createdRobots[visible[i].id] = {x: r.currentAssignment.x, y: r.currentAssignment.y, code: r.currentAssignment.code, unit: r.currentAssignment.unit};
            //r.log(Object.keys(r.createdRobots).length);
        }
    }

    //build unit from queue
    if(r.buildQueue.length > 0) {
        let requiredKarbonite = r.buildQueue[0].karbonite;
        let requiredFuel = r.buildQueue[0].fuel;

        if((r.karbonite >= requiredKarbonite + 70 && r.fuel >= requiredFuel) || (r.buildQueue[0].priority && r.karbonite >=r.buildQueue[0].karbonite && r.fuel >= r.buildQueue[0].fuel)) {
            let robot_to_build = r.buildQueue.shift();

            switch(robot_to_build.unit) {
                case SPECS.PILGRIM:
                    if(r.pilgrimQueue.length > 0) {
                        let job = r.pilgrimQueue.shift();
                        return build_unit(r, SPECS.PILGRIM, job.x, job.y, job.code);
                    }
                    break;

                case SPECS.CRUSADER:
                    if(r.crusaderQueue.length > 0) {
                        let job = r.crusaderQueue.shift();
                        return build_unit(r, SPECS.CRUSADER, job.x, job.y, job.code);
                    }
                    break;

                case SPECS.PROPHET:
                    if(r.prophetQueue.length > 0) {
                        let job = r.prophetQueue.shift();
                        return build_unit(r, SPECS.PROPHET, job.x, job.y, job.code);
                    }
                    break;

                case SPECS.PREACHER:
                    if(r.preacherQueue.length > 0) {
                        let job = r.preacherQueue.shift();
                        return build_unit(r, SPECS.PREACHER, job.x, job.y, job.code);
                    }
                    break;
            }
        }
    }
}

export function church_step(r) {
    if (r.step === 0) {
        init(r);
    } else {
        return step(r);
    }
}

