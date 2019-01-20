import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';
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
    return attempt_build(r, unit_type,util.directionTo(target_x - r.me.x,target_y - r.me.y));
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
    r.emergency_defense_units = {3:0,4:0,5:0};;
    r.size = r.map.length;
    r.HSymm = util.isHorizontallySymm(r);
    r.enemy_castle = util.getReflectedCoord(r.me, r);
    r.karboniteCoords = util.resourceCoords(r.map, r.karbonite_map, {x:r.me.x, y:r.me.y}, util.getMoves(2), r);
    r.fuelCoords = util.resourceCoords(r.map, r.fuel_map, {x:r.me.x, y:r.me.y}, util.getMoves(2), r);
    r.createdRobots = {};

    r.unitMap = combat.unitMap2(r);

    r.unitMapOther = combat.unitMap2_other(r);
    r.unitMap_crusader = combat.unitMap2_crusader(r);
    r.unitMap_crusader2 = combat.unitMap2_crusader2(r);
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
    r.unit_location_distance =Math.floor(Math.sqrt((r.me.x - r.enemy_castle.x)**2 + (r.me.y - r.enemy_castle.y)**2) / 2);
    if (r.unit_location_distance > 7) {
        r.unit_location_distance = 7;
    }
    r.unitLocationQueue = combat.unitLocationsQueue(r, 3, r.unit_location_distance, r.unitMap, true);

    r.unitLocationQueue = r.unitLocationQueue.concat(combat.unitLocationsQueue(r, 3, r.unit_location_distance, r.unitMapOther, true));
    r.unitLocationQueue_crusader = combat.unitLocationsQueue(r, 3, r.size, r.unitMap_crusader, true);
    r.unitLocationQueue_crusader = r.unitLocationQueue_crusader.concat(combat.unitLocationsQueue(r, 3, r.unit_location_distance, r.unitMap_crusader2, true));



    //r.log(r.unitLocationQueue.length + " possible units");
    r.castles = [];
    r.order = 0;
    r.unitMap_odd = combat.unitMap_odd(r);
    // r.log('unitMap odd');
    // r.log(r.unitMap_odd);

    //queues
    r.buildQueue = [];
    r.pilgrimQueue = [];
    r.preacherQueue = [];
    r.prophetQueue = [];
    r.crusaderQueue = [];

    //r.castleTalk(1);
    let robots = r.getVisibleRobots();




    //signal
    let signalingDist = Math.max(r.me.x, r.size - r.me.x) ** 2 + Math.max(r.me.y, r.size - r.me.y) ** 2;
    r.signal(util.signalCoords(r.me.x, r.me.y, constants.SIGNAL_CODE.CASTLE_POS), signalingDist);

    let visible = r.getVisibleRobots();
    for(let i=0;i<visible.length;i++) {
        if(util.decodeCoords(visible[i].signal).code === constants.SIGNAL_CODE.CASTLE_POS && visible[i].team === r.me.team) {
            r.castles.push({id: visible[i].id, x: visible[i].x, y: visible[i].y});
            r.order++;
        }
    }
}

function turn1step(r) {
    let visible = r.getVisibleRobots();
    //get castle coords on step 1
    for(let i=0;i<visible.length;i++) {
        if (util.decodeCoords(visible[i].signal).code === constants.SIGNAL_CODE.CASTLE_POS && visible[i].team === r.me.team) {
            r.castles.push({id: visible[i].id, x: visible[i].x, y: visible[i].y});
        }
    }
    r.numOfCastle = r.castles.length;

    r.church_locations = util.getResourceClusters(r.karbonite_map, r.fuel_map, constants.CLUSTER_RADIUS, r.castles, r);
    //r.log(r.church_locations);

    let karbIndex = 0;
    while((r.karboniteCoords[karbIndex].x - r.me.x) ** 2 + (r.karboniteCoords[karbIndex].y - r.me.y) ** 2 <= constants.CLUSTER_RADIUS ** 2) {
        r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 10, fuel: 200});
        r.pilgrimQueue.push({x: r.karboniteCoords[karbIndex].x, y: r.karboniteCoords[karbIndex].y, code: constants.PILGRIM_JOBS.MINE_KARBONITE});
        karbIndex++;
    }

    let fuelIndex = 0;
    while((r.fuelCoords[fuelIndex].x - r.me.x) ** 2 + (r.fuelCoords[fuelIndex].y - r.me.y) ** 2 <= constants.CLUSTER_RADIUS ** 2) {
        r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 10, fuel: 200});
        r.pilgrimQueue.push({x: r.fuelCoords[fuelIndex].x, y: r.fuelCoords[fuelIndex].y, code: constants.PILGRIM_JOBS.MINE_FUEL});
        fuelIndex++;
    }

    //find responsible church locs
    for(let i=0;i<r.church_locations.length;i++) {
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

    //find responsible karbonite locs
    for(let i=karbIndex;i<r.karboniteCoords.length;i++) {
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
    for(let i=fuelIndex;i<r.fuelCoords.length;i++) {
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

    //r.log("prophet job");
    for (let i=0;i<r.unitLocationQueue.length;i++) {
       r.buildQueue.push({unit: SPECS.PROPHET,karbonite:25, fuel: 500});
       r.prophetQueue.push({x:r.unitLocationQueue[i].x, y: r.unitLocationQueue[i].y, code: constants.PROPHET_JOBS.DEFEND_GOAL});
    }

    for (let i = 0; i < r.unitLocationQueue_crusader.length; i++) {
        r.buildQueue.push({unit: SPECS.CRUSADER, karbonite: 25, fuel: 2000});
        r.crusaderQueue.push({
            x: r.unitLocationQueue_crusader[i].x,
            y: r.unitLocationQueue_crusader[i].y,
            code: constants.CRUSADER_JOBS.DEFEND_GOAL
        });
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
        r.buildQueue.unshift({unit: SPECS.PREACHER,karbonite:30, fuel: 50,priority:true});
        r.preacherQueue.unshift({x:unitLocation.x, y: unitLocation.y, code: constants.PREACHER_JOBS.DEFEND_CASTLE});

    } else if (r.emergency_defense_units[SPECS.CRUSADER] < count[SPECS.CRUSADER]) {
        r.emergency_defense_units[SPECS.CRUSADER] += 2;
        r.buildQueue.unshift({unit: SPECS.PREACHER,karbonite:30, fuel: 50,priority:true});
        r.preacherQueue.unshift({x:unitLocation.x, y: unitLocation.y, code: constants.PREACHER_JOBS.DEFEND_CASTLE});
    } else if (r.emergency_defense_units[SPECS.PROPHET] <= count[SPECS.PROPHET]) {
        r.emergency_defense_units[SPECS.PROPHET]++;
        r.buildQueue.unshift({unit: SPECS.PROPHET,karbonite:25, fuel: 50,priority:true});
        r.prophetQueue.unshift({x:unitLocation.x, y: unitLocation.y, code: constants.PROPHET_JOBS.DEFEND_GOAL});
    }




}

function step(r) {

    let visible = r.getVisibleRobots();
    emergency_defense(r);

    //r.log(r.createdRobots);
    //r.log("created robots");
    //r.log(r.createdRobots);
    //queue reinforcements if requested by pilgrim
    // for(let i=0;i<visible.length;i++) {
    //     if(visible[i].castle_talk === constants.PILGRIM_DANGER_CASTLETALK) {
    //         r.buildQueue.unshift({unit: SPECS.PROPHET, karbonite: 25, fuel: 200});
    //         r.prophetQueue.unshift({x: r.createdRobots[visible[i].id].x, y: r.createdRobots[visible[i].id].y, code: constants.PROPHET_JOBS.REINFORCE_PILGRIM})
    //     }
    // }

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
            r.log("Unit " + myRobots[i] + " died.");


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
                r.buildQueue.unshift({unit: SPECS.PREACHER,karbonite:25, fuel: 50,priority:true});
                r.preacherQueue.unshift({x: robot.x, y: robot.y, code: constants.PREACHER_JOBS.DEFEND_CASTLE});
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
        if(visible[i].castle_talk === constants.INIT_CASTLETALK && (visible[i].x - r.me.x) ** 2 + (visible[i].y - r.me.y) ** 2 <= 2) {
            //r.log('added');
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

    if(combat.enemyInRange(r)) {

        let attack =  combat.attack_nearest_castle(r,SPECS.CASTLE,{x:r.me.x,y:r.me.y});
        if (attack !== undefined) {
            return r.attack(attack.x,attack.y);
        }
    }

}





export function castle_step(r) {
    if (r.step === 950) {
        r.signal(15,r.map.length ** 2);
        r.log("CCCCCRRRRRUUUUUUUSSSSSAAAAADDDDDEEEEERRRRR AAAAAATTTTTTAAAAAAACCCCKKKKKK!!!!!!!!!!!!!!!!!!!!!!!!");
        return;
    }

    if (r.step % 10 === 0) {
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