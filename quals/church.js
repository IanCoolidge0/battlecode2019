import * as util from "./util.js"
import {SPECS} from 'battlecode';
import * as constants from "./constants.js";

import * as combat from "./combat.js";
import * as logging from "./logging.js";


function attempt_build(r, unit, dir,target_x,target_y,job) {
    let dir_coord = [dir, util.rotateLeft(dir,1), util.rotateRight(dir,1), util.rotateLeft(dir,2),
        util.rotateRight(dir,2), util.rotateLeft(dir,3), util.rotateRight(dir,3), util.rotateLeft(dir,4)];
    let vis_map = r.getVisibleRobotMap();

    for(let i=0;i<dir_coord.length;i++) {
        let newX = r.me.x + dir_coord[i].x;
        let newY = r.me.y + dir_coord[i].y;

        if(newX < 0 || newY < 0 || newX >= r.map.length || newY >= r.map.length)
            continue;

        if(r.map[newY][newX] && vis_map[newY][newX] === 0) {
            r.currentUnitMap[target_y][target_x] = true;
            if (unit === SPECS.PREACHER && job < 8)
                r.emergency_defense_units[SPECS.PREACHER][i]++;
            if (unit === SPECS.PROPHET && job < 8)
                r.emergency_defense_units[SPECS.PROPHET][i]++;
            return r.buildUnit(unit, dir_coord[i].x, dir_coord[i].y);
        }
    }
}

function build_unit(r,unit_type,target_x,target_y,job) {
    if(r.offensiveChurch) r.log("offensive church building!");
    r.currentAssignment = {unit: unit_type, x: target_x, y: target_y, code: job};
    r.signal(util.signalCoords(target_x, target_y, job), 2);
    logging.logBuiltUnit(r, unit_type, target_x, target_y, job);

    return attempt_build(r, unit_type,util.directionTo(target_x - r.me.x,target_y - r.me.y),target_x,target_y,job);
}

function emergency_defense(r) {
    if (!combat.enemyCombatInRange(r)) return;
    let count = combat.amount_of_enemy_per_direction(r);
    //r.log("COUNT:");
    //r.log(count);
    //r.log("EMERGENCY DEFENSE");
    //r.log(r.emergency_defense_units);
    let unit_type;
    r.log(count);
    r.log(r.emergency_defense_units);
    for (let i = 0;i < 8;i++) {
        if (r.emergency_defense_units[SPECS.PREACHER][i] < count[SPECS.PREACHER][i]) {
            r.log("enemy preacher located");
            unit_type = SPECS.PREACHER;
        } else if (r.emergency_defense_units[SPECS.PREACHER][i] < Math.min(count[SPECS.CRUSADER][i],2)) {

            r.log("enemy crusader located");
            unit_type = SPECS.PREACHER;
        } else if (r.emergency_defense_units[SPECS.PROPHET][i] < count[SPECS.PROPHET][i]) {
            r.log("enemy prophet located");
            unit_type = SPECS.PROPHET;

        } else {
            continue;
        }
        let unitLocation = combat.next_emergency_Location(r,{x:r.me.x,y:r.me.y},unit_type,util.directions(i),0,r.currentUnitMap,r.defenseMap);
        if (unitLocation === undefined) continue;
        if (unit_type === SPECS.PREACHER) {
            r.emergency_defense_units[SPECS.PREACHER][i]++;
            r.log("add defensive preacher:" + unitLocation.x + " , " + unitLocation.y);
            r.buildQueue.unshift({unit: SPECS.PREACHER,karbonite:30, fuel: 50,priority:true});
            r.preacherQueue.unshift({x:unitLocation.x, y: unitLocation.y, code: constants.PREACHER_JOBS.DEFEND_CASTLE[i]});
            return;
        } else if (unit_type === SPECS.PROPHET) {

            r.log("add defensive prophet"+ unitLocation.x + " , " + unitLocation.y);
            r.buildQueue.unshift({unit: SPECS.PROPHET,karbonite:25, fuel: 50,priority:true});
            r.prophetQueue.unshift({x:unitLocation.x, y: unitLocation.y, code: constants.PROPHET_JOBS.DEFEND_CASTLE[i]});
            return;
        }
    }





}

function init(r) {
    r.defenseMap = combat.unitMap(r);
    r.currentUnitMap = util.create2dArray(r.map.length,r.map.length,false);
    r.size = r.map.length;
    r.emergency_defense_units = {3: [0,0,0,0,0,0,0,0], 4: [0,0,0,0,0,0,0,0], 5: [0,0,0,0,0,0,0,0]};
    r.defenseMap = combat.unitMap_odd(r);

    r.size = r.map.length;
    r.buildQueue = [];
    
    r.pilgrimQueue = [];
    r.preacherQueue = [];
    r.prophetQueue = [];
    r.crusaderQueue = [];
    let dir_coord = [{x:-1,y:-1}, {x:-1,y:0}, {x:-1,y:1}, {x:0,y:1}, {x:1,y:1}, {x:1,y:0}, {x:1,y:-1}, {x:0,y:-1}];
    r.unitMap = combat.unitMap2(r,2);
    //r.log("UNITMAP_________________________________________")
    //r.log(r.unitMap);
    r.unitLocationQueue_prophet = combat.unitLocationsQueue(r,4,7,r.unitMap,true);
    r.unitLocationQueue_preacher = combat.unitLocationsQueue(r,3,3,r.unitMap,true);

    r.builderJob = {};

    r.createdRobots = {};
    r.offensiveChurch = false;
    r.offenseDirection = undefined;

    let visible = r.getVisibleRobots();
    for(let i=0;i<visible.length;i++) {
        let sig = util.decodeCoords(visible[i].signal);
        if(sig.code === 5) {
            r.builderJob = sig;

            r.createdRobots[visible[i].id] = {unit: SPECS.PILGRIM, x: sig.x, y: sig.y,
                code: r.karbonite_map[sig.y][sig.x] ? constants.PILGRIM_JOBS.MINE_KARBONITE : constants.PILGRIM_JOBS.MINE_FUEL};

            break;
        }
        if(sig.code === constants.SIGNAL_CODE.CREATE_OFFENSIVE_CHURCH) {
            r.offensiveChurch = true;
            r.offenseDirection = {x: sig.x, y: sig.y};
        }
    }

    if(!r.offensiveChurch) {
        initializeDefensiveBuildQueue(r);
    } else {
        initializeOffensiveBuildQueue(r);
    }

}

function initializeOffensiveBuildQueue(r) {
    let latticeMap = combat.unitMapAggressive(r, constants.LATTICE_RADIUS, r.offenseDirection);
    let latticeQueue = combat.unitLocationsQueue(r, 3, 2 * constants.LATTICE_RADIUS, latticeMap, false);

    for(let i=0;i<latticeQueue.length;i++) {
        r.log(latticeQueue.length + " potential units");
        r.buildQueue.push({unit: SPECS.PROPHET, karbonite: 30, fuel: 200});
        r.prophetQueue.push({x: latticeQueue[i].x, y: latticeQueue[i].y, code: constants.PROPHET_JOBS.DEFEND_GOAL});
    }
}

function initializeDefensiveBuildQueue(r) {
    for(let i=-constants.CLUSTER_RADIUS;i<=constants.CLUSTER_RADIUS;i++) {
        for(let j=-constants.CLUSTER_RADIUS;j<=constants.CLUSTER_RADIUS;j++) {
            if(i ** 2 + j ** 2 > constants.CLUSTER_RADIUS ** 2) continue;
            let newX = r.me.x + i;
            let newY = r.me.y + j;

            if(util.withInMap({x: newX, y: newY}, r) && (newX !== r.builderJob.x || newY !== r.builderJob.y)) {
                if(r.fuel_map[newY][newX]) {
                    r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 25, fuel: 100, priority: true});
                    r.pilgrimQueue.push({x: newX, y: newY, code: constants.PILGRIM_JOBS.MINE_FUEL});
                }

                if(r.karbonite_map[newY][newX]) {
                    r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 25, fuel: 100});
                    r.pilgrimQueue.push({x: newX, y: newY, code: constants.PILGRIM_JOBS.MINE_KARBONITE});
                }
            }
        }
    }

    for (let i=0;i<r.unitLocationQueue_prophet.length;i++) {
        r.buildQueue.push({unit: SPECS.PROPHET,karbonite:25, fuel: 200});
        r.prophetQueue.push({x:r.unitLocationQueue_prophet[i].x, y: r.unitLocationQueue_prophet[i].y, code: constants.PROPHET_JOBS.DEFEND_GOAL});
    }
    // for (let i=0;i<r.unitLocationQueue_preacher.length;i++) {
    //     r.buildQueue.push({unit: SPECS.PREACHER,karbonite:30, fuel: 200});
    //     r.preacherQueue.push({x:r.unitLocationQueue_preacher[i].x, y: r.unitLocationQueue_preacher[i].y, code: constants.PROPHET_JOBS.DEFEND_GOAL});
    // }
}

function replaceDeadUnit(robot, r) {
    if(r.offensiveChurch) return;
    if(robot.unit === SPECS.PILGRIM) {
        if (robot.code === constants.PILGRIM_JOBS.MINE_KARBONITE) {
            r.buildQueue.unshift({unit: SPECS.PILGRIM, karbonite: 10, fuel: 200});
            r.pilgrimQueue.unshift({x: robot.x, y: robot.y, code: constants.PILGRIM_JOBS.MINE_KARBONITE});
        } else if (robot.code === constants.PILGRIM_JOBS.MINE_FUEL) {
            r.buildQueue.unshift({unit: SPECS.PILGRIM, karbonite: 10, fuel: 200});
            r.pilgrimQueue.unshift({x: robot.x, y: robot.y, code: constants.PILGRIM_JOBS.MINE_FUEL});
        }
    }
    if (robot.unit === SPECS.PREACHER) {
        if (robot.code < 8) {
            r.emergency_defense_units[SPECS.PREACHER][robot.code]--;
        }
    }
    if (robot.unit === SPECS.PROPHET) {
        if (robot.code < 8) {
            r.emergency_defense_units[SPECS.PROPHET][robot.code]--;
        }
    }
}

// function defenseQueue(r) {
//     if (r.buildQueue.length > 0) return;
//     r.log("add defensive prophet");
//     let enemyCoord = util.getReflectedCoord({x:r.me.x, y:r.me.y},r);
//     let direction = util.directionTo(enemyCoord.x - r.me.x, enemyCoord.y - r.me.y);
//     let location = combat.next_unitLocation_within_vision(r,direction,6,2);
//     r.buildQueue.push({unit: SPECS.PROPHET,karbonite:25, fuel: 200});
//     r.prophetQueue.push({x:location.x, y: location.y, code: constants.PROPHET_JOBS.DEFEND_GOAL});
// }
function step(r) {
    emergency_defense(r);

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
                        if (!r.currentUnitMap[job.y][job.x])
                            return build_unit(r, SPECS.PILGRIM, job.x, job.y, job.code);
                    }
                    break;

                case SPECS.CRUSADER:
                    if(r.crusaderQueue.length > 0) {
                        let job = r.crusaderQueue.shift();
                        if (!r.currentUnitMap[job.y][job.x])
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
                        if (!r.currentUnitMap[job.y][job.x])
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

