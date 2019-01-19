import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';
import * as combat from "./combat.js";

function attempt_build(r, unit) {
    let dir_coord = [{x:-1,y:-1}, {x:-1,y:0}, {x:-1,y:1}, {x:0,y:1}, {x:1,y:1}, {x:1,y:0}, {x:1,y:-1}, {x:0,y:-1}];
    let vis_map = r.getVisibleRobotMap();

    for(let i=0;i<dir_coord.length;i++) {
        let newX = r.me.x + dir_coord[i].x;
        let newY = r.me.y + dir_coord[i].y;

        if(r.map[newY][newX] && vis_map[newY][newX] === 0) {

            return r.buildUnit(unit, dir_coord[i].x, dir_coord[i].y);
        }
    }
}

function build_unit(r,unit_type,target_x,target_y,job) {
    r.currentAssignment = {x: target_x, y: target_y, code: job};
    r.signal(util.signalCoords(target_x, target_y, job), 2);
    r.log("built " + unit_type + " at: " + target_x + ", " + target_y + "  job: " + job);
    return attempt_build(r, unit_type);
}

function reassign_signal(unit_type, radius, r) {
    switch(unit_type) {
        case SPECS.PILGRIM:
            if(r.pilgrimQueue.length > 0) {
                let job = r.pilgrimQueue.shift();
                r.signal(util.signalCoords(job.x, job.y, job.code), radius);
            }
            break;
        case SPECS.CRUSADER:
            if(r.crusaderQueue.length > 0) {
                let job = r.crusaderQueue.shift();
                r.signal(util.signalCoords(job.x, job.y, job.code), radius);
            }
            break;
        case SPECS.PROPHET:
            if(r.prophetQueue.length > 0) {
                let job = r.prophetQueue.shift();
                r.signal(util.signalCoords(job.x, job.y, job.code), radius);
            }
            break;
        case SPECS.PREACHER:
            if(r.preacherQueue.length > 0) {
                let job = r.preacherQueue.shift();
                r.signal(util.signalCoords(job.x, job.y, job.code), radius);
            }
            break;
    }
}

function init(r) {

    r.size = r.map.length;
    r.numOfCastle = r.getVisibleRobots().length;
    r.HSymm = util.isHorizontallySymm(r);
    r.enemy_castle = util.getReflectedCoord(r.me, r);
    r.karboniteCoords = util.resourceCoords(r.map, r.karbonite_map, {x:r.me.x, y:r.me.y}, util.getMoves(2), r);
    r.fuelCoords = util.resourceCoords(r.map, r.fuel_map, {x:r.me.x, y:r.me.y}, util.getMoves(2), r);
    r.createdRobots = {};

    r.unitMap = combat.unitMap(r);
    // for (let i = 0;i < r.size;i++) {
    //     let str = "";
    //     for (let j = 0;j < r.size;j++) {
    //         if (r.unitMap[i][j])
    //             str += '1';
    //         else
    //             str += '0';
    //     }
    //     r.log(str);
    // }
    //r.log(r.unitMap);
    r.unitLocationQueue = combat.unitLocationsQueue(r,20);
    r.log(r.unitLocationQueue.length + " possible units");
    r.castles = [];
    r.order = 0;

    //queues
    r.buildQueue = [];
    r.pilgrimQueue = [];
    r.preacherQueue = [];
    r.prophetQueue = [];
    r.crusaderQueue = [];

    //r.castleTalk(1);
    let robots = r.getVisibleRobots();

    for(let i=0;i<3;i++) {
        r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 10, fuel: 50});
        r.pilgrimQueue.push({x: r.karboniteCoords[i].x, y: r.karboniteCoords[i].y, code: constants.PILGRIM_JOBS.MINE_KARBONITE});
    }
    for(let i=0;i<3;i++) {
        r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 10, fuel: 50});
        r.pilgrimQueue.push({x: r.fuelCoords[i].x, y: r.fuelCoords[i].y, code: constants.PILGRIM_JOBS.MINE_FUEL});
    }

    r.log("prophet job");
    for (let i=0;i<r.unitLocationQueue.length;i++) {
        r.buildQueue.push({unit: SPECS.PROPHET,karbonite:25, fuel: 200});
        r.prophetQueue.push({x:r.unitLocationQueue[i].x, y: r.unitLocationQueue[i].y, code: constants.PROPHET_JOBS.DEFEND_GOAL});
    }


    //signal
    let signalingDist = Math.max(r.me.x, r.size - r.me.x) ** 2 + Math.max(r.me.y, r.size - r.me.y) ** 2;
    r.signal(util.signalCoords(r.me.x, r.me.y, constants.SIGNAL_CODE.CASTLE_POS), signalingDist);

    let visible = r.getVisibleRobots();
    for(let i=0;i<visible.length;i++) {
        if(util.decodeCoords(visible[i].signal).code === constants.SIGNAL_CODE.CASTLE_POS) {
            r.castles.push({id: visible[i].id, x: visible[i].x, y: visible[i].y});
            if(r.me.team === visible[i].team)
                r.order++;
        }
    }
}

function turn1step(r) {
    let visible = r.getVisibleRobots();
    //get castle coords on step 1
    for(let i=0;i<visible.length;i++) {
        if (util.decodeCoords(visible[i].signal).code === constants.SIGNAL_CODE.CASTLE_POS) {
            r.castles.push({id: visible[i].id, x: visible[i].x, y: visible[i].y});
        }
    }

    //find responsible karbonite locs
    for(let i=0;i<r.karboniteCoords.length;i++) {
        let amIresponsible = true;
        for(let j=0;j<r.castles.length;j++) {
            let dist = (r.castles[j].x - r.karboniteCoords[i].x) ** 2 + (r.castles[j].y - r.karboniteCoords[i].y) ** 2;
            if(dist < (r.me.x - r.karboniteCoords[i].x) ** 2 + (r.me.y - r.karboniteCoords[i].y) ** 2) {
                amIresponsible = false;
                break;
            }
        }

        if(amIresponsible) {
            r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 10, fuel: 200});
            r.pilgrimQueue.push({x: r.karboniteCoords[i].x, y: r.karboniteCoords[i].y, code: constants.PILGRIM_JOBS.MINE_KARBONITE});
        }
    }

    //find responsible fuel locs
    for(let i=0;i<r.fuelCoords.length;i++) {
        let amIresponsible = true;
        for(let j=0;j<r.castles.length;j++) {
            let dist = (r.castles[j].x - r.fuelCoords[i].x) ** 2 + (r.castles[j].y - r.fuelCoords[i].y) ** 2;
            if(dist < (r.me.x - r.fuelCoords[i].x) ** 2 + (r.me.y - r.fuelCoords[i].y) ** 2) {
                amIresponsible = false;
                break;
            }
        }

        if(amIresponsible) {
            r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 10, fuel: 200});
            r.pilgrimQueue.push({x: r.fuelCoords[i].x, y: r.fuelCoords[i].y, code: constants.PILGRIM_JOBS.MINE_FUEL});
        }
    }

    r.church_locations = util.sortClusters(util.getResourceClusters(r.karbonite_map, constants.CLUSTER_RADIUS, r), r.castles);
}

function step(r) {
    let visible = r.getVisibleRobots();


    //queue reinforcements if requested by pilgrim
    for(let i=0;i<visible.length;i++) {
        if(visible[i].castle_talk === constants.PILGRIM_DANGER_CASTLETALK) {
            r.buildQueue.unshift({unit: SPECS.PROPHET, karbonite: 25, fuel: 200});
            r.prophetQueue.unshift({x: r.createdRobots[visible[i].id].x, y: r.createdRobots[visible[i].id].y, code: constants.PROPHET_JOBS.REINFORCE_RESOURCE})
        }
    }

    //replace dead units and remove them from r.createdRobots
    let myRobots = Object.keys(r.createdRobots);
    let toRemove = [];
    for(let i=0;i<myRobots.length;i++) {
        let robot = r.createdRobots[myRobots[i]];
        let alive = false;

        for(let j=0;j<visible.length;j++) {
            if(visible[j].id === myRobots[i])
                alive = true;
        }

        if(!alive) {
            r.log("A unit died.");

            if(robot.unit === SPECS.PILGRIM) {
                if (robot.code === constants.PILGRIM_JOBS.MINE_KARBONITE) {
                    r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 10, fuel: 200});
                    r.pilgrimQueue.push({x: robot.x, y: robot.y, code: constants.PILGRIM_JOBS.MINE_KARBONITE});
                } else if (robot.code === constants.PILGRIM_JOBS.MINE_FUEL) {
                    r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 10, fuel: 200});
                    r.pilgrimQueue.push({x: robot.x, y: robot.y, code: constants.PILGRIM_JOBS.MINE_FUEL});
                }
            }

            toRemove.push(myRobots[i]);
        }
    }

    for(let i=0;i<toRemove.length;i++) {
        delete r.createdRobots[toRemove[i]];
    }

    ///// GENERAL CASTLE CODE /////

    //assignment
    for(let i=0;i<visible.length;i++) {
        if(visible[i].castle_talk === constants.INIT_CASTLETALK) {
            r.createdRobots[visible[i].id] = {unit: r.unit, x: r.currentAssignment.x, y: r.currentAssignment.y, code: r.currentAssignment.code};
        }
    }

    //build unit from queue
    if(r.buildQueue.length > 0) {
        if(r.karbonite >= r.buildQueue[0].karbonite * (r.numOfCastle - r.order) && r.fuel >= r.buildQueue[0].fuel) {
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

    for(let i=0;i<visible.length;i++) {
        if(visible[i].team !== r.me.team)
            return r.attack(visible[i].x - r.me.x, visible[i].y - r.me.y);
    }

}





export function castle_step(r) {
    if (r.step % 100 === 0) {
        r.log("STEP: " + r.step);
    }
    if (r.step === 0) {
        init(r);
    } else if (r.step > 0) {
        if(r.step === 1)
            turn1step(r);
        return step(r);
    }

}