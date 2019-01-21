import * as util from "./util.js"
import {SPECS} from 'battlecode';
import * as constants from "./constants.js";

import * as combat from "./combat.js";


function attempt_build(r, unit,dir) {
    let dir_coord = [dir, util.rotateLeft(dir,1), util.rotateRight(dir,1), util.rotateLeft(dir,2),
        util.rotateRight(dir,2), util.rotateLeft(dir,3), util.rotateRight(dir,3), util.rotateLeft(dir,4)];
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
    r.currentAssignment = {unit: unit_type, x: target_x, y: target_y, code: job};
    r.signal(util.signalCoords(target_x, target_y, job), 2);
    r.log("built " + unit_type + " at: " + target_x + ", " + target_y + "  job: " + job);
    return attempt_build(r, unit_type,util.directionTo(target_x,target_y));
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

    r.emergency_defense_units = {3:0,4:0,5:0};
    r.unitMap_odd = combat.unitMap_odd(r);

    for (let i=0;i<r.unitLocationQueue.length;i++) {
        r.buildQueue.push({unit: SPECS.PROPHET,karbonite:25, fuel: 200});
        r.prophetQueue.push({x:r.unitLocationQueue[i].x, y: r.unitLocationQueue[i].y, code: constants.PROPHET_JOBS.DEFEND_GOAL});
    }
}

function emergency_defense(r) {
    if (!combat.enemyCombatInRange(r)) return;
    let count = combat.amount_of_enemy(r);
    //r.log("COUNT:");
    //r.log(count);
    //r.log("EMERGENCY DEFENSE");
    //r.log(r.emergency_defense_units);
    if (r.emergency_defense_units[SPECS.CRUSADER] >= count[SPECS.CRUSADER] &&
        r.emergency_defense_units[SPECS.PROPHET] >= count[SPECS.PROPHET] &&
        r.emergency_defense_units[SPECS.PREACHER] >= count[SPECS.PREACHER]) return;
    let enemyLocation;
    let enemyType;
    let robots = r.getVisibleRobots();

    for (let i = 0;i < robots.length;i++) {
        let robot = robots[i];
        if(!r.isVisible(robot) || r.me.team === robot.team) continue;
        if (robot.unit === SPECS.PILGRIM || robot.unit === SPECS.CASTLE || robot.unit === SPECS.CHURCH) continue;

        enemyLocation = {x:robot.x,y:robot.y};

        break;

    }


    let enemyDirection = util.directionTo(enemyLocation.x - r.me.x,enemyLocation.y - r.me.y);
    let unitLocation = combat.next_unitLocation_odd(r,enemyDirection,r.unitMap_odd);
    //r.log("emergency unit at" + unitLocation.x + ", " + unitLocation.y);
    if (unitLocation === undefined) {
        unitLocation = enemyLocation;
    } else {
        r.unitMap_odd[unitLocation.y][unitLocation.x] = false;
    }
    if (r.emergency_defense_units[SPECS.PREACHER] < count[SPECS.PREACHER]) {
        r.emergency_defense_units[SPECS.PREACHER]++;
        r.buildQueue.unshift({unit: SPECS.PREACHER,karbonite:30, fuel: 50});
        r.preacherQueue.unshift({x:unitLocation.x, y: unitLocation.y, code: constants.PREACHER_JOBS.DEFEND_CASTLE});

    } else if (r.emergency_defense_units[SPECS.CRUSADER] < count[SPECS.CRUSADER]) {
        r.emergency_defense_units[SPECS.CRUSADER] += 2;
        r.buildQueue.unshift({unit: SPECS.PREACHER,karbonite:30, fuel: 50});
        r.preacherQueue.unshift({x:unitLocation.x, y: unitLocation.y, code: constants.PREACHER_JOBS.DEFEND_CASTLE});
    } else if (r.emergency_defense_units[SPECS.PROPHET] <= count[SPECS.PROPHET]) {
        r.emergency_defense_units[SPECS.PROPHET]++;
        r.buildQueue.unshift({unit: SPECS.PROPHET,karbonite:25, fuel: 50});
        r.prophetQueue.unshift({x:unitLocation.x, y: unitLocation.y, code: constants.PROPHET_JOBS.DEFEND_GOAL});
    }




}

function step(r) {

    emergency_defense(r);
    //assignment
    let visible = r.getVisibleRobots();
    for(let i=0;i<visible.length;i++) {
        if(visible[i].castle_talk === constants.INIT_CASTLETALK && (visible[i].x - r.me.x) ** 2 + (visible[i].y - r.me.y) ** 2 <= 2) {
            //r.log('added');
            r.createdRobots[visible[i].id] = {x: r.currentAssignment.x, y: r.currentAssignment.y, code: r.currentAssignment.code, unit: r.currentAssignment.unit};
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

