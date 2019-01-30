import * as util from "./util.js"
import {SPECS} from 'battlecode';
import * as constants from "./constants.js";

import * as combat from "./combat.js";
import * as logging from "./logging.js";
import * as wallutil from "./wallutil.js";

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
            if (unit === SPECS.PROPHET || unit === SPECS.PREACHER)
                r.currentUnitMap[target_y][target_x] = true;
            if (unit === SPECS.PREACHER && job < 8)
                r.emergency_defense_units[SPECS.PREACHER][job]++;
            if (unit === SPECS.PROPHET && job < 8)
                r.emergency_defense_units[SPECS.PROPHET][job]++;
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
    if (!combat.enemyCombatInBuildingRange(r)) return;
    let count = combat.amount_of_enemy_per_direction(r);
    //r.log("COUNT:");
    //r.log(count);
    //r.log("EMERGENCY DEFENSE");
    //r.log(r.emergency_defense_units);
    let unit_type;
    //r.log(count);
    //r.log(r.emergency_defense_units);
    for (let i = 0;i < 8;i++) {
        if (r.emergency_defense_units[SPECS.PREACHER][i] < count[SPECS.PREACHER][i]) {
            //r.log("enemy preacher located");
            unit_type = SPECS.PREACHER;
        } else if (r.emergency_defense_units[SPECS.PREACHER][i] < Math.min(count[SPECS.CRUSADER][i],2)) {

            //r.log("enemy crusader located");
            unit_type = SPECS.PREACHER;
        } else if (r.emergency_defense_units[SPECS.PROPHET][i] < count[SPECS.PROPHET][i]) {
            //r.log("enemy prophet located");
            unit_type = SPECS.PROPHET;

        } else {
            continue;
        }
        let unitLocation = combat.next_emergency_Location(r,{x:r.me.x,y:r.me.y},unit_type,util.directions(i),0,r.currentUnitMap,r.defenseMap);
        if (unitLocation === undefined) continue;
        if (unit_type === SPECS.PREACHER && r.karbonite >= 30 && r.fuel >= 50) {

            r.log("add defensive preacher:" + unitLocation.x + " , " + unitLocation.y + " with code: " + i);
            //r.log("CODE::" + i);
            r.buildQueue.unshift({unit: SPECS.PREACHER,karbonite:30, fuel: 50,priority:true});
            r.preacherQueue.unshift({x:unitLocation.x, y: unitLocation.y, code: constants.PREACHER_JOBS.DEFEND_CASTLE[i]});
            return;
        } else if (unit_type === SPECS.PROPHET && r.karbonite >= 25 && r.fuel >= 50) {

            r.log("add defensive prophet"+ unitLocation.x + " , " + unitLocation.y + " with code: " + i);
            //r.log("CODE::" + i);
            r.buildQueue.unshift({unit: SPECS.PROPHET,karbonite:25, fuel: 50,priority:true});
            r.prophetQueue.unshift({x:unitLocation.x, y: unitLocation.y, code: constants.PROPHET_JOBS.DEFEND_CASTLE[i]});
            return;
        }
    }





}

function initializeEnemyBuildQueue(r) {
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
    for (let i=0;i<r.unitLocationQueue_preacher.length;i++) {
        r.buildQueue.push({unit: SPECS.PREACHER,karbonite:30, fuel: 200});
        r.preacherQueue.push({x:r.unitLocationQueue_preacher[i].x, y: r.unitLocationQueue_preacher[i].y, code: constants.PREACHER_JOBS.DEFEND_GOAL});
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


    r.builderJob = {};

    r.createdRobots = {};
    r.offensiveChurch = false;
    r.offenseDirection = undefined;
    r.inEnemyTerritory = false;

    r.offensiveLocationQueue = [];

    r.combatBuildCooldown = 5;

    let visible = r.getVisibleRobots();
    for(let i=0;i<visible.length;i++) {
        let sig = util.decodeCoords(visible[i].signal);
        if(sig.code === constants.SIGNAL_CODE.CREATE_FRIENDLY_CHURCH) {
            r.unitMap = combat.unitMap2(r,1);
            //r.log("UNITMAP_________________________________________")
            //r.log(r.unitMap);
            r.unitLocationQueue_prophet = combat.unitLocationsQueue(r,6,7,r.unitMap,true);
            r.unitLocationQueue_preacher = combat.unitLocationsQueue(r,3,3,r.unitMap,true);
            r.unitLocationQueue_prophet2 = combat.unitLocationsQueue(r,4,5,r.unitMap,true);

            r.builderJob = sig;

            r.createdRobots[visible[i].id] = {unit: SPECS.PILGRIM, x: sig.x, y: sig.y,
                code: r.karbonite_map[sig.y][sig.x] ? constants.PILGRIM_JOBS.MINE_KARBONITE : constants.PILGRIM_JOBS.MINE_FUEL};
            initializeDefensiveBuildQueue(r);
            break;
        }
        if(sig.code === constants.SIGNAL_CODE.CREATE_ENEMY_CHURCH) {
            //r.log("sjfiioafhiadfhuwefuhiwefuiw3r");
            r.unitMap = combat.unitMap(r);
            //r.log("UNITMAP_________________________________________")
            //r.log(r.unitMap);
            r.unitLocationQueue_prophet = combat.unitLocationsQueue(r,6,7,r.unitMap,true);
            r.unitLocationQueue_preacher = combat.unitLocationsQueue(r,3,3,r.unitMap,true);
            r.unitLocationQueue_prophet2 = combat.unitLocationsQueue(r,4,5,r.unitMap,true);

            r.builderJob = sig;
            r.enemyChurch = true;
            r.inEnemyTerritory = true;
            r.createdRobots[visible[i].id] = {unit: SPECS.PILGRIM, x: sig.x, y: sig.y,
                code: r.karbonite_map[sig.y][sig.x] ? constants.PILGRIM_JOBS.MINE_KARBONITE : constants.PILGRIM_JOBS.MINE_FUEL};
            initializeDefensiveBuildQueue(r);
            break;
        }
        if(sig.code === constants.SIGNAL_CODE.CREATE_OFFENSIVE_CHURCH) {
            let allyCastle = {x:sig.x,y:sig.y};

            r.allyIsLower = util.isLower(r,allyCastle);

            r.offensiveChurch = true;
            r.myScoutId = visible[i].id;
            r.scoutInitialPos = {x: visible[i].x, y: visible[i].y};
            //r.offenseDirection = {x: sig.x, y: sig.y};
            initializeOffensiveBuildQueue(r);
        }
        if(sig.code === constants.SIGNAL_CODE.CREATE_PREACHER_CHURCH) {
            r.offensiveChurch = true;
            r.enemyCastlePosition = {x: sig.x, y: sig.y};
            r.preacherChurch = true;
            r.log("preacher church created");
            r.castleTalk(constants.PREACHER_CHURCH_INIT);
            r.signal(util.signalCoords(r.me.x, r.me.y, constants.SIGNAL_CODE.PREACHER_CHURCH_INIT), 2 * map.length ** 2);

            for(let i=0;i<1000;i++) {
                r.buildQueue.push({unit: SPECS.PREACHER, karbonite: 30, fuel: 50, override_build_map: true});
                r.preacherQueue.push({x: sig.x, y: sig.y, code: constants.PREACHER_JOBS.SUICIDE});
            }
        }
    }



}

function initializeOffensiveBuildQueue(r) {
    // let latticeMap = combat.unitMapAggressive(r, constants.LATTICE_RADIUS, r.offenseDirection);
    // let latticeQueue = combat.unitLocationsQueue(r, 3, 2 * constants.LATTICE_RADIUS, latticeMap, false);
    //
    // for(let i=0;i<latticeQueue.length;i++) {
    //     //r.log(latticeQueue.length + " potential units");
    //     r.buildQueue.push({unit: SPECS.PROPHET, karbonite: 30, fuel: 200});
    //     r.prophetQueue.push({x: latticeQueue[i].x, y: latticeQueue[i].y, code: constants.PROPHET_JOBS.DEFEND_GOAL});
    // }


}

function initializeDefensiveBuildQueue(r) {
    for(let i=-constants.CLUSTER_RADIUS;i<=constants.CLUSTER_RADIUS;i++) {
        for(let j=-constants.CLUSTER_RADIUS;j<=constants.CLUSTER_RADIUS;j++) {
            if(i ** 2 + j ** 2 > constants.CLUSTER_RADIUS ** 2) continue;
            let newX = r.me.x + i;
            let newY = r.me.y + j;

            if(util.withInMap({x: newX, y: newY}, r) && (newX !== r.builderJob.x || newY !== r.builderJob.y)) {
                if(r.fuel_map[newY][newX]) {
                    r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 10, fuel: 100, priority: true});
                    r.pilgrimQueue.push({x: newX, y: newY, code: constants.PILGRIM_JOBS.MINE_FUEL});
                }

                if(r.karbonite_map[newY][newX]) {
                    r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 10, fuel: 100});
                    r.pilgrimQueue.push({x: newX, y: newY, code: constants.PILGRIM_JOBS.MINE_KARBONITE});
                }
            }
        }
    }

    for (let i=0;i<r.unitLocationQueue_prophet.length;i++) {
        r.buildQueue.push({unit: SPECS.PROPHET,karbonite:25, fuel: 200});
        r.prophetQueue.push({x:r.unitLocationQueue_prophet[i].x, y: r.unitLocationQueue_prophet[i].y, code: constants.PROPHET_JOBS.DEFEND_GOAL});
    }
    for (let i=0;i<r.unitLocationQueue_preacher.length;i++) {
        r.buildQueue.push({unit: SPECS.PREACHER,karbonite:30, fuel: 200});
        r.preacherQueue.push({x:r.unitLocationQueue_preacher[i].x, y: r.unitLocationQueue_preacher[i].y, code: constants.PREACHER_JOBS.DEFEND_GOAL});
    }
    for (let i=0;i<r.unitLocationQueue_prophet2.length;i++) {
        r.buildQueue.push({unit: SPECS.PROPHET,karbonite:25, fuel: 200});
        r.prophetQueue.push({x:r.unitLocationQueue_prophet2[i].x, y: r.unitLocationQueue_prophet2[i].y, code: constants.PROPHET_JOBS.DEFEND_GOAL});
    }
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
        r.currentUnitMap[robot.y][robot.x] = false;
        if (robot.code < 8) {
            r.emergency_defense_units[SPECS.PREACHER][robot.code]--;
        }
    }
    if (robot.unit === SPECS.PROPHET) {
        r.currentUnitMap[robot.y][robot.x] = false;
        if (robot.code < 8) {
            r.emergency_defense_units[SPECS.PROPHET][robot.code]--;
        }
    }
}

function buildOffensiveQueue(r) {
    if(!r.preacherChurch) {
        let visible = r.getVisibleRobots();

        let position = null;

        for (let i = 0; i < visible.length; i++) {
            if (util.decodeCoords(visible[i].signal).code === constants.SIGNAL_CODE.CREATE_OFFENSIVE_CHURCH && visible[i].id === r.myScoutId && !r.preacherChurch) {
                r.offensiveChurch = false;
                return;
            }

            if (util.decodeCoords(visible[i].signal).code === constants.SIGNAL_CODE.SCOUT_INFO && visible[i].id === r.myScoutId) {
                position = {x: visible[i].x, y: visible[i].y};
                break;
            }
        }

        if (position === null)
            return;

        let back = wallutil.backward(r, r.scoutInitialPos);

        let next = {x: position.x + back.x, y: position.y + back.y};

        if (util.withInMap(next, r) && r.map[next.y][next.x] && (next.y !== r.me.y || next.x !== r.me.x)) {
            r.buildQueue.push({unit: SPECS.PROPHET, karbonite: 30, fuel: 50});
            if (r.allyIsLower) {
                r.prophetQueue.push({x: next.x, y: next.y, code: constants.PROPHET_JOBS.ATTACK_GOAL_LOWER});
            } else {
                r.prophetQueue.push({x: next.x, y: next.y, code: constants.PROPHET_JOBS.ATTACK_GOAL_HIGHER});
            }

        }

        let next2;
        if (back.x === 0)
            next2 = {x: position.x - 1, y: position.y + 2 * back.y};
        else
            next2 = {x: position.x + 2 * back.x, y: position.y - 1};
        if (util.withInMap(next2, r) && r.map[next2.y][next2.x] && (next2.y !== r.me.y || next2.x !== r.me.x)) {
            r.buildQueue.push({unit: SPECS.PROPHET, karbonite: 30, fuel: 50});
            if (r.allyIsLower) {
                r.prophetQueue.push({x: next2.x, y: next2.y, code: constants.PROPHET_JOBS.ATTACK_GOAL_LOWER});
            } else {
                r.prophetQueue.push({x: next2.x, y: next2.y, code: constants.PROPHET_JOBS.ATTACK_GOAL_HIGHER});
            }
        }

        let next4;
        if (back.x === 0)
            next4 = {x: position.x - 1, y: position.y + 3 * back.y};
        else
            next4 = {x: position.x + 3 * back.x, y: position.y - 1};
        if (util.withInMap(next4, r) && r.map[next4.y][next4.x] && (next4.y !== r.me.y || next4.x !== r.me.x)) {
            r.buildQueue.push({unit: SPECS.PREACHER, karbonite: 30, fuel: 50});
            if (r.allyIsLower) {
                r.preacherQueue.push({x: next4.x, y: next4.y, code: constants.PREACHER_JOBS.ATTACK_GOAL_LOWER});
            } else {
                r.preacherQueue.push({x: next4.x, y: next4.y, code: constants.PREACHER_JOBS.ATTACK_GOAL_HIGHER});
            }
        }


        let next3 = {x: position.x + 3 * back.x, y: position.y + 3 * back.y};
        if (util.withInMap(next3, r) && r.map[next3.y][next3.x] && (next3.y !== r.me.y || next3.x !== r.me.x)) {
            r.buildQueue.push({unit: SPECS.PROPHET, karbonite: 30, fuel: 50});
            if (r.allyIsLower) {
                r.prophetQueue.push({x: next3.x, y: next3.y, code: constants.PROPHET_JOBS.ATTACK_GOAL_LOWER});
            } else {
                r.prophetQueue.push({x: next3.x, y: next3.y, code: constants.PROPHET_JOBS.ATTACK_GOAL_HIGHER});
            }
        }


        // r.log(position);
        // r.log("POSSIBLE UNIT POSITIONS!!!!!!!!!!!!!!!!!");
        //
        // r.log(next);
        // r.log(next2);
        // r.log(next3);
        // r.log(next4);
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
            r.log(visible[i].id);
            r.createdRobots[visible[i].id] = {x: r.currentAssignment.x, y: r.currentAssignment.y, code: r.currentAssignment.code, unit: r.currentAssignment.unit};
            //r.log(Object.keys(r.createdRobots).length);
        }
    }

    if(r.combatBuildCooldown > 0)
        r.combatBuildCooldown--;

    //build unit from queue
    if(r.buildQueue.length > 0) {
        let requiredKarbonite = r.buildQueue[0].karbonite;
        let requiredFuel = r.buildQueue[0].fuel;

        if((r.karbonite >= requiredKarbonite + 70 && r.fuel >= requiredFuel) && (r.buildQueue[0].unit === SPECS.PILGRIM || r.combatBuildCooldown === 0 || r.offensiveChurch || r.buildQueue[0].override_build_map) || (r.buildQueue[0].priority && r.karbonite >=r.buildQueue[0].karbonite && r.fuel >= r.buildQueue[0].fuel)) {
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
                        if (!r.currentUnitMap[job.y][job.x] || robot_to_build.override_build_map) {
                            r.combatBuildCooldown = 5 + Math.floor((r.map.length - 32) / 6);
                            return build_unit(r, SPECS.PROPHET, job.x, job.y, job.code);
                        }
                    }
                    break;

                case SPECS.PREACHER:
                    if(r.preacherQueue.length > 0) {
                        let job = r.preacherQueue.shift();
                        if (!r.currentUnitMap[job.y][job.x] || robot_to_build.override_build_map) {
                            r.combatBuildCooldown = 5 + Math.floor((r.map.length - 32) / 6);
                            return build_unit(r, SPECS.PREACHER, job.x, job.y, job.code);
                        }
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
        if(r.offensiveChurch)
            buildOffensiveQueue(r);

        if(!r.enemyChurch && !r.offensiveChurch)
            lateGameStep(r);

        return step(r);
    }
}

function lateGameStep(r) {
    //r.log(r.buildQueue.length + " asjfihasohfuiasohfbfhu8oaw " + r.karbonite + " " + r.fuel);
    // if(r.buildQueue.length === 0 && (r.karbonite > 1234 || (r.step > 600 && r.karbonite > 200)) && r.fuel > 4321) {
    //     let fuelRatio = r.fuel / r.karbonite;
    //
    //     let coord = util.findCoord(r);
    //
    //     if(fuelRatio < 2.5) {
    //         r.buildQueue.push({unit: SPECS.PREACHER, karbonite: 50, fuel: 50, override_build_map: true});
    //         r.preacherQueue.push({x: coord.x, y: coord.y, code: constants.PREACHER_JOBS.DEFEND_GOAL});
    //     } else {
    //         r.buildQueue.push({unit: SPECS.CRUSADER, karbonite: 50, fuel: 50, override_build_map: true});
    //         r.crusaderQueue.push({x: coord.x, y: coord.y, code: constants.CRUSADER_JOBS.DEFEND_GOAL});
    //     }
    // }
}
