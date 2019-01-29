import * as util from "./util.js";
import * as wallutil from "./wallutil.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';
import * as combat from "./combat.js";
import * as mode from "./mode.js";

function affordChurch(r) {

    if(r.fuel < 250)
        return false;

    if(r.karbonite > 50) {
        if(r.currentJob.code === constants.PILGRIM_JOBS.BUILD_ENEMY_CHURCH || combat.enemyInRange(r))
            return true;
    }

    return r.karbonite > 80 && r.currentJob.code === constants.PILGRIM_JOBS.BUILD_CHURCH;
}

function oldMoveToResourceStep(r) {
    if(r.currentJob.code === constants.PILGRIM_JOBS.BUILD_CHURCH || r.currentJob.code === constants.PILGRIM_JOBS.BUILD_ENEMY_CHURCH) {
        let dist = (r.me.x - r.currentJob.x) ** 2 + (r.me.y - r.currentJob.y) ** 2;
        if(dist <= 2 && dist > 0) {
            //r.nearestResourceTile = util.getNearestResourceTile(r);
            if (((r.karbonite > 50 && (r.currentJob.code === constants.PILGRIM_JOBS.BUILD_ENEMY_CHURCH || combat.enemyInRange(r))) || (r.karbonite > 100 && r.currentJob.code === constants.PILGRIM_JOBS.BUILD_CHURCH))  && r.fuel > 200) {
                r.log("building church at (" + r.currentJob.x + "," + r.currentJob.y + ")");

                let church_pos = {x: r.currentJob.x, y: r.currentJob.y};
                r.mode = constants.PILGRIM_MODE.MOVE_TO_RESOURCE;

                r.parent_building = {x: church_pos.x, y: church_pos.y};
                r.castle_map = util.BFSMap(r.map, {x: r.parent_building.x, y: r.parent_building.y}, util.getMoves(2));
                //r.resource_map = util.BFSMap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));

                r.signal(util.signalCoords(r.currentJob.x, r.currentJob.y, 5), 2);

                return r.buildUnit(SPECS.CHURCH, church_pos.x - r.me.x, church_pos.y - r.me.y);
            } else {
                return r.mine();
            }
        } else if(dist === 0) {
            let vismap = r.getVisibleRobotMap();
            let dir_coord = [{x:0,y:-1}, {x:1,y:-1}, {x:1,y:0}, {x:1,y:1}, {x:0,y:1}, {x:-1,y:1}, {x:-1,y:0}, {x:-1,y:-1}];
            for(let i=0;i<dir_coord.length;i++) {
                let newX = r.me.x + dir_coord[i].x;
                let newY = r.me.y + dir_coord[i].y;
                //r.log(""+r.map[newY][newX]);
                if(newX >= 0 && newY >= 0 && newX < r.map.length && newY < r.map.length && r.map[newY][newX] && vismap[newY][newX] === 0)
                    return r.move(dir_coord[i].x, dir_coord[i].y);
            }
        }
    }
}

function moveToResourceStep(r) {
    if(r.resource_map[r.me.y][r.me.x] !== 99) {
        return mode.travel_to_goal_pilgrim(r, r.resource_map,r.pass_map,{x: r.goal.x, y: r.goal.y},util.getMoves(2));
    } else {
        if(r.currentJob.code === constants.PILGRIM_JOBS.BUILD_CHURCH || r.currentJob.code === constants.PILGRIM_JOBS.BUILD_ENEMY_CHURCH) {
            if(affordChurch(r) && r.getVisibleRobotMap()[r.currentJob.y][r.currentJob.x] <= 0) {
                r.mode = constants.PILGRIM_MODE.MOVE_TO_CASTLE;

                r.parent_building = {x: r.currentJob.x, y: r.currentJob.y};
                r.castle_map = util.BFSMap(r.map, {x: r.parent_building.x, y: r.parent_building.y}, util.getMoves(2));

                if(r.currentJob.code === constants.PILGRIM_JOBS.BUILD_CHURCH)
                    r.signal(util.signalCoords(r.me.x, r.me.y, constants.SIGNAL_CODE.CREATE_FRIENDLY_CHURCH), 2);
                else if(r.currentJob.code === constants.PILGRIM_JOBS.BUILD_ENEMY_CHURCH) {
                    r.signal(util.signalCoords(r.me.x, r.me.y, constants.SIGNAL_CODE.CREATE_ENEMY_CHURCH), 2);
                }

                if(r.karbonite_map[r.me.y][r.me.x])
                    r.currentJob.code = constants.PILGRIM_JOBS.MINE_KARBONITE;
                else
                    r.currentJob.code = constants.PILGRIM_JOBS.MINE_FUEL;

                //r.log("building a church at " + r.parent_building.x + "," + r.parent_building.y + ", i am going to " + r.me.x + "," + r.me.y);

                // r.log("i want to build at " + (r.parent_building.x) + " " + (r.parent_building.y));
                // r.log("i have " + r.karbonite + " karb" + " and " + r.fuel + " fuel!!!!!!!!!! at step " + r.step);

                return r.buildUnit(SPECS.CHURCH, r.parent_building.x - r.me.x, r.parent_building.y - r.me.y);
            }
        } else {
            //r.log("switching to mine resource " + r.currentJob.code);
            r.mode = constants.PILGRIM_MODE.MINE_RESOURCE;
        }

        if((r.karbonite_map[r.me.y][r.me.x] && r.me.karbonite <= 18) || (r.fuel_map[r.me.y][r.me.x] && r.me.fuel <= 90))
            return r.mine();
    }
}

function searchForChurch(r, deposit_radius) {
    let visible = r.getVisibleRobots();
    for(let i=0;i<visible.length;i++) {
        if(visible[i].unit === SPECS.CHURCH && (r.me.x - visible[i].x) ** 2 + (r.me.y - visible[i].y) ** 2 <= deposit_radius ** 2) {
            r.parent_building = {x: visible[i].x, y: visible[i].y};
            r.castle_map = util.BFSMap(r.map, {x: r.parent_building.x, y: r.parent_building.y}, util.getMoves(2));
            return;
        }
    }
}

function mineResourceStep(r) {
    // let visible = r.getVisibleRobots();
    // let danger_units = 0;
    // for(let i=0;i<visible.length;i++) {
    //     let robot = visible[i];
    //     let dist = (r.me.x - robot.x) ** 2 + (r.me.y - robot.y) ** 2;
    //
    //     if((robot.unit === SPECS.PROPHET && dist <= 64) || (robot.unit === SPECS.PREACHER && dist <= 36) || (robot.unit === SPECS.CRUSADER && dist <= 16))
    //         danger_units++;
    // }
    //
    // if(danger_units > 0 && (r.me.x - r.parent_castle.x) ** 2 + (r.me.y - r.parent_castle.y) ** 2 >= 25) {
    //     r.castleTalk(constants.PILGRIM_DANGER_CASTLETALK);
    // }

    if(r.step < 20) {
        let visible = r.getVisibleRobots();
        for (let i = 0; i < visible.length; i++) {
            if(visible[i].unit === SPECS.PREACHER && visible[i].team === r.me.team && (r.me.x - visible[i].x) ** 2 + (r.me.y - visible[i].y) ** 2) {
                //oh shit

                if(r.currentJob.code === constants.PILGRIM_JOBS.MINE_KARBONITE && r.me.karbonite >= 8)
                    r.mode = constants.PILGRIM_MODE.MOVE_TO_CASTLE;
            }
        }
    }

    if(r.currentJob.code === constants.PILGRIM_JOBS.MINE_KARBONITE && r.me.karbonite >= 18) {
        r.mode = constants.PILGRIM_MODE.MOVE_TO_CASTLE;
    }

    if(r.currentJob.code === constants.PILGRIM_JOBS.MINE_FUEL && r.me.fuel >= 90) {
        r.mode = constants.PILGRIM_MODE.MOVE_TO_CASTLE;
    }

    // if(r.step < 20) {
    //     let visible = r.getVisibleRobots();
    //     for (let i = 0; i < visible.length; i++) {
    //         if (visible[i].unit === SPECS.PREACHER && visible[i].team === r.me.team && (r.me.x - visible[i].x) ** 2 + (r.me.y - visible[i].y) ** 2 <= constants.CLUSTER_RADIUS ** 2) {
    //             //oh shit
    //
    //             if(r.currentJob.code === constants.PILGRIM_JOBS.MINE_KARBONITE && r.me.karbonite >= 8) {
    //                 r.mode = constants.PILGRIM_MODE.MOVE_TO_CASTLE;
    //                 r.log("switching to move to castle");
    //             }
    //         }
    //     }
    // }

    return r.mine();
}

function moveToCastleStep(r) {
    let px = r.parent_building.x;
    let py = r.parent_building.y;

    if((r.me.x - px) ** 2 + (r.me.y - py) ** 2 > 2) {
        return mode.travel_to_goal_pilgrim(r, r.castle_map,r.map,{x: r.parent_building.x, y: r.parent_building.y},util.getMoves(2));
    } else {
        if(r.getVisibleRobotMap()[py][px] === 0) {
            if (r.karbonite > 50 && r.fuel > 200)
                return r.buildUnit(SPECS.CHURCH, px - r.me.x, py - r.me.y);
        } else {

            r.mode = constants.PILGRIM_MODE.MOVE_TO_RESOURCE;

            let dx = px - r.me.x;
            let dy = py - r.me.y;
            //r.log('giving at ' + dx + "," + dy);
            return r.give(dx, dy, r.me.karbonite, r.me.fuel);
        }
    }
}

function init(r) {
    r.castleTalk(constants.INIT_CASTLETALK);
    r.signal(util.signalCoords(0, 0, constants.SIGNAL_CODE.INIT_SIGNAL), 2);

    r.parent_building = util.findParentCastle(r);
    r.parent_building_coords = {x: r.parent_building.x, y: r.parent_building.y};

    r.currentJob = util.decodeCoords(r.parent_building.signal);

    r.castle_map = util.BFSMap_with_rmap(r.map, {x: r.parent_building.x, y: r.parent_building.y}, util.getMoves(2),r);
    //r.resource_map = util.BFSMap_with_rmap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2),r);

    r.job = r.currentJob.code;
    r.mode = constants.PILGRIM_MODE.MOVE_TO_RESOURCE;

    if (r.job === constants.PILGRIM_JOBS.BUILD_ENEMY_CHURCH) {
        r.log("building enemy church");
        r.safety_map = util.safetyMap(r, [util.getReflectedCoord({x: r.parent_building.x, y: r.parent_building.y}, r)]);
        r.goal = util.getNearestResourceTile2(r, {x: r.currentJob.x, y: r.currentJob.y});
        r.resource_map = util.BFSMap_with_rmap(r.safety_map, {x: r.goal.x, y: r.goal.y}, util.getMoves(2),r);

        r.pass_map = r.safety_map;
    } else if (r.job === constants.PILGRIM_JOBS.BUILD_CHURCH) {
        r.log('building friendly church');
        r.goal = util.getNearestResourceTile2(r, {x: r.currentJob.x, y: r.currentJob.y});
        r.resource_map = util.BFSMap_with_rmap(r.map, {x: r.goal.x, y: r.goal.y}, util.getMoves(2),r);
        r.pass_map = r.map;
    } else if (r.job === constants.PILGRIM_JOBS.OFFENSIVE) {
        r.mode = constants.PILGRIM_MODE.MOVE_OFFENSIVE;
        r.builtOffensiveChurch = false;
        r.castle_loc = {x: r.currentJob.x, y: r.currentJob.y};
        r.goal_pos = util.offensivePilgrimGoal(r, r.castle_loc);
        r.resource_map = util.BFSMap_with_rmap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2),r);
        r.pass_map = r.map;
    } else if (r.job === constants.PILGRIM_JOBS.BUILD_WALL) {
        r.mode = constants.PILGRIM_MODE.MOVE_OFFENSIVE;
        r.resource_map = util.BFSMap_with_rmap(r.map, util.getReflectedCoord({x: r.currentJob.x, y: r.currentJob.y}, r), util.getMoves(2),r);
        r.pass_map = r.map;
        r.starting_pos = {x: r.me.x, y: r.me.y};
    } else if (r.job === constants.PILGRIM_JOBS.BUILD_WALL_SUBSEQUENT) {
        r.mode = constants.PILGRIM_MODE.MOVE_OFFENSIVE;
        r.lastChurchPos = {x: r.currentJob.x, y: r.currentJob.y};
        r.desiredPos = wallutil.wallLocationSubsequent(r, {x: r.currentJob.x, y: r.currentJob.y});
        r.pass_map = r.map;
        r.resource_map = util.BFSMap_with_rmap(r.map, {x: r.desiredPos.x, y: r.desiredPos.y}, util.getMoves(2),r);
        r.starting_pos = {x: r.me.x, y: r.me.y};
    } else if(r.job === constants.PILGRIM_JOBS.BUILD_PREACHER_CHURCH) {
        r.mode = constants.PILGRIM_MODE.MOVE_OFFENSIVE2;
        r.resource_map = util.BFSMap(wallutil.buildingAvoidanceMap(r), util.getReflectedCoord(r.parent_building_coords, r), util.getMoves(2));
        r.starting_pos = {x: r.me.x, y: r.me.y};
    } else {
        r.resource_map = util.BFSMap_with_rmap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2),r);
    }

    r.requestedReinforcements = false;
}


export function isEndangered(r) {

    // if( combat.enemyCombatInRange(r)) {
    //
    //     r.log(r.getVisibleRobots());
    //     let damageMap = combat.damageMap2(r);
    //     r.log(damageMap);
    // }


    if(r.currentJob.code !== constants.PILGRIM_JOBS.MINE_FUEL && r.currentJob.code !== constants.PILGRIM_JOBS.MINE_KARBONITE) return;


    if (combat.enemyCombatInRange(r)) {
        //r.log("CHANGE MODE to FLEE");
        r.mode = constants.PILGRIM_MODE.FLEE;
    } else if (r.mode === constants.PILGRIM_MODE.FLEE){
        //r.log("CHANGE MODE to MINING");
        r.mode = constants.PILGRIM_MODE.MOVE_TO_RESOURCE;
    }
}

export function flee(r) {
    let damageMap = combat.damageMap(r);
    //r.log(damageMap);
    let moves = util.getMoves(2);

    //r.log(moves);

    let rmap = r.getVisibleRobotMap();
    let move = r.castle_map[r.me.y][r.me.x];
    let potential_moves = util.getFuzzyMoves(r, move.x, move.y, 2, 2);

    for(let i=0;i<potential_moves.length;i++) {
        let next = {x:r.me.x - potential_moves[i].x, y:r.me.y - potential_moves[i].y};
        if (util.withInMap(next,r) && r.map[next.y][next.x] && damageMap[next.y][next.x] === 0 && rmap[next.y][next.x] === 0) {
            //r.log('flee move');

            return r.move(-potential_moves[i].x, -potential_moves[i].y);

        }
    }
    // for (let i = 0;i < moves.length;i++) {
    //     const next = {x:r.me.x + moves[i].x,y:r.me.y + moves[i].y};
    //
    //     if (util.withInMap(next,r) && r.map[next.y][next.x] && damageMap[next.y][next.x] === 0 && rmap[next.y][next.x] === 0) {
    //         r.log('flee move');
    //
    //         return r.move(moves[i].x,moves[i].y);
    //
    //     }
    // }
}


function moveOffensiveStep(r) {
    if(r.mode === constants.PILGRIM_MODE.MOVE_OFFENSIVE && r.resource_map[r.me.y][r.me.x] === 99) {
        r.mode = constants.PILGRIM_MODE.MOVE_OFFENSIVE2;
        r.resource_map = util.BFSMap_with_rmap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2),r);
    }

    if(r.mode === constants.PILGRIM_MODE.MOVE_OFFENSIVE2 && (combat.enemyInRange(r) || r.resource_map[r.me.y][r.me.x] === 99) && r.karbonite > 50 && r.fuel > 200) {
        //made it all the way through

        r.log("building offensive church");
        if(r.job === constants.PILGRIM_JOBS.BUILD_WALL) {
            r.wait = 0;

            r.mode = constants.PILGRIM_MODE.SCOUT;
            let accessible_map = util.BFSMap_with_rmap(wallutil.safetyMap(r), {x: r.me.x, y: r.me.y}, util.getMoves(2),r);

            r.scout_destination = wallutil.scoutDestinationUp(r, {x: r.currentJob.x, y: r.currentJob.y}, accessible_map);
            r.goal_map = util.BFSMap_with_rmap(wallutil.safetyMap(r), r.scout_destination, util.getMoves(2),r);

            r.signal(util.signalCoords(r.parent_building_coords.x, r.parent_building_coords.y, constants.SIGNAL_CODE.CREATE_OFFENSIVE_CHURCH), 2);

            r.church_pos = wallutil.freeOffensiveChurch(r);

            r.seenUnitMap = util.copy(r.map);
            wallutil.addSeenUnits(r, r.seenUnitMap);

            r.back = wallutil.pilgrim_backward(r, r.church_pos);
            return r.buildUnit(SPECS.CHURCH, r.church_pos.x - r.me.x, r.church_pos.y - r.me.y);
        } else if(r.job === constants.PILGRIM_JOBS.BUILD_PREACHER_CHURCH) {
            r.log("building preacher church");
            r.mode = constants.PILGRIM_MODE.SIGNAL_PREACHERS;
            r.signal(util.signalCoords(r.currentJob.x, r.currentJob.y, constants.SIGNAL_CODE.CREATE_PREACHER_CHURCH), 2);
            r.church_pos = wallutil.freeOffensiveChurch(r);

            return r.buildUnit(SPECS.CHURCH, r.church_pos.x - r.me.x, r.church_pos.y - r.me.y);
        }
         // else if(r.job === constants.PILGRIM_JOBS.BUILD_WALL_SUBSEQUENT) {
        //     //what is left
        //     r.scout_destination = {x: r.lastChurchPos.x, y: r.lastChurchPos.y};
        //     r.goal_map = util.BFSMap_with_rmap(wallutil.safetyMap(r), r.scout_destination, util.getMoves(2),r);
        //
        //     r.signal(util.signalCoords(r.currentJob.x, r.currentJob.y, constants.SIGNAL_CODE.CREATE_OFFENSIVE_CHURCH), 2);
        //
        //     r.church_pos = wallutil.freeOffensiveChurch(r);
        //     return r.buildUnit(SPECS.CHURCH, r.church_pos.x - r.me.x, r.church_pos.y - r.me.y);
        // }
    }
    //r.log(r.me.x + ", " + r.me.y);
    if(r.me.x !== r.currentJob.x || r.me.y !== r.currentJob.y)
        return mode.travel_to_goal_pilgrim(r, r.resource_map,r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));
}

function scoutStep(r) {
    let church_dist = (r.church_pos.x - r.scout_destination.x) ** 2 + (r.church_pos.y - r.scout_destination.y) ** 2;

    if((r.me.x - r.scout_destination.x) ** 2 + (r.me.y - r.scout_destination.y) ** 2 > 2) {
        if(r.lastPos === undefined || wallutil.checkCompletePositions(r, {x: r.me.x, y: r.me.y}, r.back) || r.wait === constants.WALL_WAIT || combat.enemyCombatInRange(r)) {
            wallutil.addSeenUnits(r, r.seenUnitMap);

            if(wallutil.testLine(r, r.church_pos, r.seenUnitMap) && (r.church_pos.x - r.me.x) ** 2 + (r.church_pos.y - r.me.y) ** 2 >= 100) {
                r.log("building new church: church_dist " + church_dist);
                r.church_pos = wallutil.freeOffensiveChurch(r);
                r.signal(util.signalCoords(r.me.x, r.me.y, constants.SIGNAL_CODE.CREATE_OFFENSIVE_CHURCH), church_dist);
                return r.buildUnit(SPECS.CHURCH, r.church_pos.x - r.me.x, r.church_pos.y - r.me.y);
            }

            let safety_map = wallutil.safetyMap(r);
            let accessible_map = util.BFSMap_with_rmap(wallutil.safetyMap(r), {x: r.me.x, y: r.me.y}, util.getMoves(2),r);
            r.scout_destination = wallutil.scoutDestinationUp(r, {x: r.currentJob.x, y: r.currentJob.y}, accessible_map);
            r.goal_map = util.BFSMap_with_rmap(r.seenUnitMap, r.scout_destination, util.getMoves(2),r);

            r.lastPos = {x: r.me.x, y: r.me.y};
            r.wait = 0;
            r.log("sending " + r.me.x + " " + r.me.y);
            r.signal(util.signalCoords(r.me.x, r.me.y, constants.SIGNAL_CODE.SCOUT_INFO), church_dist);
            return mode.travel_to_goal_pilgrim(r, r.goal_map,r.seenUnitMap, r.scout_destination, util.getMoves(2));
        } else r.wait++;
    } else {
        //finished scouting for church
        r.signal(util.signalCoords(r.church_pos.x, r.church_pos.y, constants.SIGNAL_CODE.DONE_SCOUTING), 2 * r.map.length ** 2);
        r.mode = constants.PILGRIM_MODE.NOTHING;
    }
}

export function pilgrim_step(r) {
    //r.log("x:" + r.me.x + "  y: " + r.me.y);
    if (r.step === 0) {
        init(r);
    } else
        r.castleTalk(124);

    isEndangered(r);

    switch(r.mode) {
        case constants.PILGRIM_MODE.MOVE_TO_RESOURCE:
            return moveToResourceStep(r);
            break;
        case constants.PILGRIM_MODE.MINE_RESOURCE:
            return mineResourceStep(r);
            break;
        case constants.PILGRIM_MODE.MOVE_TO_CASTLE:
            return moveToCastleStep(r);
            break;
        case constants.PILGRIM_MODE.FLEE:
            return flee(r);
            break;
        case constants.PILGRIM_MODE.MOVE_OFFENSIVE:
            return moveOffensiveStep(r);
            break;
        case constants.PILGRIM_MODE.MOVE_OFFENSIVE2:
            return moveOffensiveStep(r);
            break;
        case constants.PILGRIM_MODE.SCOUT:
            return scoutStep(r);
            break;
    }
}