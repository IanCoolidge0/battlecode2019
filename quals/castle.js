import {SPECS} from 'battlecode';

import * as util from "./util.js";
import * as wallutil from "./wallutil.js";
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
    r.currentAssignment = {unit: unit_type, x: target_x, y: target_y, code: job};
    r.signal(util.signalCoords(target_x, target_y, job), 2);
    logging.logBuiltUnit(r, unit_type, target_x, target_y, job);

    return attempt_build(r, unit_type,util.directionTo(target_x - r.me.x,target_y - r.me.y),target_x,target_y,job);
}

function initVariables(r) {
    r.emergency_defense_units = {3: [0,0,0,0,0,0,0,0], 4: [0,0,0,0,0,0,0,0], 5: [0,0,0,0,0,0,0,0]};
    r.size = r.map.length;
    r.HSymm = util.isHorizontallySymm(r);
    r.enemy_castle = util.getReflectedCoord(r.me, r);
    r.karboniteCoords = util.resourceCoords(r.map, r.karbonite_map, {x:r.me.x, y:r.me.y}, util.getMoves(2), r);
    r.fuelCoords = util.resourceCoords(r.map, r.fuel_map, {x:r.me.x, y:r.me.y}, util.getMoves(2), r);
    r.createdRobots = {};

    r.unit_location_distance =Math.floor(Math.sqrt((r.me.x - r.enemy_castle.x)**2 + (r.me.y - r.enemy_castle.y)**2) / 2);
    if (r.unit_location_distance > 7) {
        r.unit_location_distance = 7;
    }

    r.castles = [];



    r.order = 0;
}

function initUnitMaps(r) {
    //prophet maps

    //r.prophetMapGrid = combat.unitMap2(r);
    //r.prophetMapFill = combat.unitMap2_other(r);
    r.currentUnitMap = util.create2dArray(r.map.length,r.map.length,false);
    //r.prophetMapAgg = combat.unitMapAggressive(r, 6);
    //r.prophetLocations = combat.unitLocationsQueue(r, 3, r.unit_location_distance, r.prophetMapGrid, true);
    //r.prophetLocations = r.prophetLocations.concat(combat.unitLocationsQueue(r, 3, r.unit_location_distance, r.prophetMapFill, true));
    //r.prophetLocations = combat.unitLocationsQueue(r, 3, Math.floor(Math.sqrt((r.me.x - r.enemy_castle.x)**2 + (r.me.y - r.enemy_castle.y)**2) / 2), r.prophetMapAgg, false);

    //r.prophetMapGrid = combat.unitMap2(r);
    //r.prophetMapFill = combat.unitMap2_other(r);

    //r.prophetMapAgg = combat.unitMapAggressive(r, 6);
    //r.prophetLocations = combat.unitLocationsQueue(r, 3, r.unit_location_distance, r.prophetMapGrid, true);

    //r.prophetLocations = r.prophetLocations.concat(combat.unitLocationsQueue(r, 3, r.unit_location_distance, r.prophetMapFill, true));
    //r.prophetLocations = combat.unitLocationsQueue(r, 3, Math.floor(Math.sqrt((r.me.x - r.enemy_castle.x)**2 + (r.me.y - r.enemy_castle.y)**2) / 2), r.prophetMapAgg, false);

    //r.prophetLocations = [];

    //crusader maps
    //r.crusaderMapCenter = combat.unitMap2_crusader(r);
    //r.crusaderMapEdge = combat.unitMap2_crusader2(r);

    //r.crusaderLocations = combat.unitLocationsQueue(r, 3, r.size, r.crusaderMapCenter, true);
    //r.crusaderLocations = r.crusaderLocations.concat(combat.unitLocationsQueue(r, 3, r.size, r.crusaderMapEdge, true));
    r.unitMap = combat.unitMap2(r,2);
    //r.log("UNITMAP_________________________________________")
    //r.log(r.unitMap);
    r.unitLocationQueue_prophet = combat.unitLocationsQueue(r,4,7,r.unitMap,true);
    r.unitLocationQueue_preacher = combat.unitLocationsQueue(r,3,3,r.unitMap,true);
    //defense map
    r.defenseMap = combat.unitMap(r);
}

function init(r) {
    initVariables(r);
    initUnitMaps(r);

    //queues
    r.buildQueue = [];
    r.pilgrimQueue = [];
    r.preacherQueue = [];
    r.prophetQueue = [];
    r.crusaderQueue = [];

    //signal to all other castles for counting and order
    r.signalingDist = Math.max(r.me.x, r.size - r.me.x) ** 2 + Math.max(r.me.y, r.size - r.me.y) ** 2;
    r.signal(util.signalCoords(r.me.x, r.me.y, constants.SIGNAL_CODE.CASTLE_POS), r.signalingDist);

    let visible = r.getVisibleRobots();
    for(let i=0;i<visible.length;i++) {
        if(util.decodeCoords(visible[i].signal).code === constants.SIGNAL_CODE.CASTLE_POS && visible[i].team === r.me.team) {
            r.castles.push({id: visible[i].id, x: visible[i].x, y: visible[i].y});
            r.order++;
        }
    }
}

function initializeCastles(r) {
    let visible = r.getVisibleRobots();
    //get castle coords on step 1
    for(let i=0;i<visible.length;i++) {
        if (util.decodeCoords(visible[i].signal).code === constants.SIGNAL_CODE.CASTLE_POS && visible[i].team === r.me.team) {
            r.castles.push({id: visible[i].id, x: visible[i].x, y: visible[i].y});
        }
    }
    r.numOfCastle = r.castles.length;

    r.enemy_castles = [];
    for(let i=0;i<r.numOfCastle;i++)
        r.enemy_castles.push(util.getReflectedCoord({x: r.castles[i].x, y: r.castles[i].y}, r));

    r.safety_map = util.safetyMap(r, r.enemy_castles);
}

function initializeChurches(r) {
    r.church_locations = util.getResourceClusters(r.karbonite_map, r.fuel_map, constants.CLUSTER_RADIUS, r.castles, r);

    r.enemy_church_locations = [];
    for(let i=0;i<r.church_locations.length;i++)
        r.enemy_church_locations.push(util.getReflectedCoord({x: r.church_locations[i].x, y: r.church_locations[i].y}, r));

    r.safe_enemy_churches = [];
    for(let i=0;i<r.enemy_church_locations.length;i++) {
        if(util.isEnemyDepositSafe(r, r.enemy_church_locations[i], r.safety_map)) {
            //r.log("enemy location " + r.enemy_church_locations[i].x + "," + r.enemy_church_locations[i].y + " is safe");
            r.safe_enemy_churches.push(r.enemy_church_locations[i]);
            if (r.safe_enemy_churches.length >= 2) break;
        }
    }

    //wall locations
    r.wall_locationIndex = 0;
    r.wall_locations = wallutil.getWallLocations(r);
}

function initializeBuildQueue(r) {

    //queue nearby karbonite locations
    for(let i=-5;i<5;i++) {
        for(let j=-5;j<5;j++) {
            if(i ** 2 + j ** 2 > constants.CLUSTER_RADIUS ** 2) continue;
            if(util.withInMap({x: r.me.x + i, y: r.me.y + j}, r) && r.karbonite_map[r.me.y + j][r.me.x + i]) {
                r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 10, fuel: 200,priority:true});
                r.pilgrimQueue.push({x: r.me.x + i, y: r.me.y + j, code: constants.PILGRIM_JOBS.MINE_KARBONITE});
            }
        }
    }

    for(let i=0;i<Math.min(r.safe_enemy_churches.length, 2);i++) {
        let amIresponsible = true;

        for(let j=0;j<r.castles.length;j++) {
            let dist = (r.castles[j].x - r.safe_enemy_churches[i].x) ** 2 + (r.castles[j].y - r.safe_enemy_churches[i].y) ** 2;
            if(dist < (r.me.x - r.safe_enemy_churches[i].x) ** 2 + (r.me.y - r.safe_enemy_churches[i].y) ** 2) {
                amIresponsible = false;
                break;
            }
        }

        if(amIresponsible) {
            r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 10, fuel: 50, priority: true});
            r.pilgrimQueue.push({x: r.safe_enemy_churches[i].x, y: r.safe_enemy_churches[i].y, code: constants.PILGRIM_JOBS.BUILD_ENEMY_CHURCH});

            r.buildQueue.push({unit: SPECS.CRUSADER, karbonite: 20, fuel: 50, priority: true});
            r.crusaderQueue.push({x: r.safe_enemy_churches[i].x, y: r.safe_enemy_churches[i].y, code: constants.CRUSADER_JOBS.DEFEND_ENEMY_CHURCH});

            for(let j=0;j<r.church_locations.length;j++) {
                if((r.church_locations[j].x - r.safe_enemy_churches[i].x) ** 2 + (r.church_locations[j].y - r.safe_enemy_churches[i].y) ** 2 <= constants.CLUSTER_RADIUS ** 2)
                    r.church_locations[j].alreadyVisited = true;
            }
        }
    }

    //queue nearby fuel locations
    for(let i=-5;i<5;i++) {
        for(let j=-5;j<5;j++) {
            if(i ** 2 + j ** 2 > constants.CLUSTER_RADIUS ** 2) continue;
            if(util.withInMap({x: r.me.x + i, y: r.me.y + j}, r) && r.fuel_map[r.me.y + j][r.me.x + i]) {
                r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 10, fuel: 200});
                r.pilgrimQueue.push({x: r.me.x + i, y: r.me.y + j, code: constants.PILGRIM_JOBS.MINE_FUEL});
            }
        }
    }

    //find responsible church locs
    for(let i=0;i<r.church_locations.length;i++) {
        if(r.church_locations[i].alreadyVisited) continue;

        let amIresponsible = true;
        for(let j=0;j<r.castles.length;j++) {
            let dist = (r.castles[j].x - r.church_locations[i].x) ** 2 + (r.castles[j].y - r.church_locations[i].y) ** 2;
            if(dist < (r.me.x - r.church_locations[i].x) ** 2 + (r.me.y - r.church_locations[i].y) ** 2) {
                amIresponsible = false;
                break;
            }
        }

        if(amIresponsible) {
            //r.log("putting church at " + r.church_locations[i].x + "," + r.church_locations[i].y + " on build queue");
            r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 10, fuel: 200});
            r.pilgrimQueue.push({x: r.church_locations[i].x, y: r.church_locations[i].y, code: constants.PILGRIM_JOBS.BUILD_CHURCH});
        }
    }

    //queue prophet lattice
    // for (let i=0;i<r.prophetLocations.length;i++) {
    //     r.buildQueue.push({unit: SPECS.PROPHET, karbonite:25, fuel: 500});
    //     r.prophetQueue.push({x:r.prophetLocations[i].x, y: r.prophetLocations[i].y, code: constants.PROPHET_JOBS.DEFEND_GOAL});
    // }
    for (let i=0;i<r.unitLocationQueue_prophet.length;i++) {
        r.buildQueue.push({unit: SPECS.PROPHET,karbonite:25, fuel: 200});
        r.prophetQueue.push({x:r.unitLocationQueue_prophet[i].x, y: r.unitLocationQueue_prophet[i].y, code: constants.PROPHET_JOBS.DEFEND_GOAL});
    }
    for (let i=0;i<r.unitLocationQueue_preacher.length;i++) {
        r.buildQueue.push({unit: SPECS.PREACHER,karbonite:30, fuel: 200});
        r.preacherQueue.push({x:r.unitLocationQueue_preacher[i].x, y: r.unitLocationQueue_preacher[i].y, code: constants.PREACHER_JOBS.DEFEND_GOAL});
    }
    //queue crusader rush
    // for (let i = 0; i < r.crusaderLocations.length; i++) {
    //     r.buildQueue.push({unit: SPECS.CRUSADER, karbonite: 15, fuel: 2000});
    //     r.crusaderQueue.push({
    //         x: r.crusaderLocations[i].x,
    //         y: r.crusaderLocations[i].y,
    //         code: constants.CRUSADER_JOBS.DEFEND_GOAL
    //     });
    // }
}

function turn1step(r) {
    initializeCastles(r);
    initializeChurches(r);

    initializeBuildQueue(r);
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
        if (unit_type === SPECS.PREACHER && r.karbonite >= 30 && r.fuel >= 50) {

            r.log("add defensive preacher:" + unitLocation.x + " , " + unitLocation.y + " with code: " + i);
            r.log("CODE::" + i);
            r.buildQueue.unshift({unit: SPECS.PREACHER,karbonite:30, fuel: 50,priority:true});
            r.preacherQueue.unshift({x:unitLocation.x, y: unitLocation.y, code: i});
            return;
        } else if (unit_type === SPECS.PROPHET && r.karbonite >= 25 && r.fuel >= 50) {

            r.log("add defensive prophet"+ unitLocation.x + " , " + unitLocation.y);
            r.log("CODE::" + i);
            r.buildQueue.unshift({unit: SPECS.PROPHET,karbonite:25, fuel: 50,priority:true});
            r.prophetQueue.unshift({x:unitLocation.x, y: unitLocation.y, code: i});
            return;
        }
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

function wallingStep(r) {
    if(r.step === 100) {
        let amIresponsible = true;
        let wall_loc = wallutil.getWallLocation2(r);

        for(let j=0;j<r.castles.length;j++) {
            let dist = (r.castles[j].x - wall_loc.x) ** 2 + (r.castles[j].y - wall_loc.y) ** 2;
            if (dist < (r.me.x - wall_loc.x) ** 2 + (r.me.y - wall_loc.y) ** 2) {
                amIresponsible = false;
                break;
            }
        }

        if(amIresponsible) {
            r.buildQueue.unshift({unit: SPECS.PILGRIM, karbonite: 10, fuel: 50});
            r.pilgrimQueue.unshift({x: wall_loc.x, y: wall_loc.y, code: constants.PILGRIM_JOBS.BUILD_WALL});
        }

        r.wall_locationIndex++;
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
            replaceDeadUnit(robot, r);
            toRemove.push(myRobots[i]);
        }
    }
    for(let i=0;i<toRemove.length;i++) {
        delete r.createdRobots[toRemove[i]];
    }

    //assignment
    for(let i=0;i<visible.length;i++) {
        if(visible[i].castle_talk === constants.INIT_CASTLETALK && (visible[i].x - r.me.x) ** 2 + (visible[i].y - r.me.y) ** 2 <= 2) {
            r.createdRobots[visible[i].id] = {x: r.currentAssignment.x, y: r.currentAssignment.y, code: r.currentAssignment.code, unit: r.currentAssignment.unit};
        }
    }

    //build unit from queue
    if(r.buildQueue.length > 0) {
        let requiredKarbonite = r.buildQueue[0].karbonite;
        let requiredFuel = r.buildQueue[0].fuel;

        if(r.step % r.numOfCastle !== r.order) {
            requiredKarbonite *= r.numOfCastle;
            requiredFuel *= r.numOfCastle;
        }

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
                        if (!r.currentUnitMap[job.y][job.x] || robot_to_build.override_build_map)
                            return build_unit(r, SPECS.PROPHET, job.x, job.y, job.code);
                    }
                    break;

                case SPECS.PREACHER:
                    if(r.preacherQueue.length > 0) {
                        let job = r.preacherQueue.shift();
                        if (!r.currentUnitMap[job.y][job.x] || robot_to_build.override_build_map)
                            return build_unit(r, SPECS.PREACHER, job.x, job.y, job.code);
                    }
                    break;
            }
        }
    }

    //castle attack if nothing else to do
    if(combat.enemyInRange(r)) {
        let attack =  combat.attack_nearest_castle(r,SPECS.CASTLE,{x:r.me.x,y:r.me.y});
        // let enemy_type = r.getRobot(visible[attack.y][attack.x]).unit;
        // if (enemy_type === SPECS.CRUSADER) {
        //     r.signal(util.signalCoords(attack.x, attack.y, constants.ENEMY_CRUSADER), 100);
        // } else if (enemy_type === SPECS.PROPHET) {
        //     r.signal(util.signalCoords(attack.x, attack.y, constants.ENEMY_PROPHET), 100);
        // } else if (enemy_type === SPECS.PREACHER) {
        //     r.signal(util.signalCoords(attack.x, attack.y, constants.ENEMY_PREACHER), 100);
        // }
        if (attack !== undefined) {
            return r.attack(attack.x,attack.y);
        }
    }

}

function lateGameStep(r) {
    //r.log(r.buildQueue.length + " asjfihasohfuiasohfbfhu8oaw " + r.karbonite + " " + r.fuel);
    if(r.buildQueue.length === 0 && r.karbonite > 1234 && r.fuel > 4321) {
        let fuelRatio = r.fuel / r.karbonite;

        let coord = util.findCoord(r);

        if(fuelRatio > 2.5) {
            r.buildQueue.unshift({unit: SPECS.PREACHER, karbonite: 50, fuel: 50, override_build_map: true});
            r.preacherQueue.unshift({x: coord.x, y: coord.y, code: constants.PREACHER_JOBS.DEFEND_GOAL});
        } else {
            r.buildQueue.unshift({unit: SPECS.CRUSADER, karbonite: 50, fuel: 50, override_build_map: true});
            r.crusaderQueue.unshift({x: coord.x, y: coord.y, code: constants.CRUSADER_JOBS.DEFEND_GOAL});
        }
    }
}

export function castle_step(r) {

    if (r.step % 10 === 0) {
        r.log("STEP: " + r.step);
        // for (let y = 0;y < r.map.length;y++) {
        //     let str = "";
        //     for (let x = 0;x < r.map.length;x++) {
        //         if (r.currentUnitMap[y][x]) {
        //             str += 1;
        //         } else {
        //             str += 0;
        //         }
        //
        //     }
        //     r.log(str);
        // }
    }

    if (r.step === 0) {

        init(r);
    } else {

        if(r.step === 1)
            turn1step(r);

        wallingStep(r);

        lateGameStep(r);

        if (r.step === 950) {
            r.signal(15,r.map.length ** 2);
            r.log("CCCCCRRRRRUUUUUUUSSSSSAAAAADDDDDEEEEERRRRR AAAAAATTTTTTAAAAAAACCCCKKKKKK!!!!!!!!!!!!!!!!!!!!!!!!");
            return;
        }

        emergency_defense(r);
        return step(r);
    }

}