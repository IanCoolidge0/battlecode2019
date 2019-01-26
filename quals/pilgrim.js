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

    return r.karbonite > 50 && r.currentJob.code === constants.PILGRIM_JOBS.BUILD_CHURCH;
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
        return mode.travel_to_goal(r, 2, 2, r.resource_map);
    } else {
        if(r.currentJob.code === constants.PILGRIM_JOBS.BUILD_CHURCH || r.currentJob.code === constants.PILGRIM_JOBS.BUILD_ENEMY_CHURCH) {
            if(affordChurch(r) && r.getVisibleRobotMap()[r.currentJob.y][r.currentJob.x] <= 0) {
                r.mode = constants.PILGRIM_MODE.MOVE_TO_CASTLE;

                r.parent_building = {x: r.currentJob.x, y: r.currentJob.y};
                r.castle_map = util.BFSMap(r.map, {x: r.parent_building.x, y: r.parent_building.y}, util.getMoves(2));

                if(r.karbonite_map[r.me.y][r.me.x])
                    r.currentJob.code = constants.PILGRIM_JOBS.MINE_KARBONITE;
                else
                    r.currentJob.code = constants.PILGRIM_JOBS.MINE_FUEL;

                //r.log("building a church at " + r.parent_building.x + "," + r.parent_building.y + ", i am going to " + r.me.x + "," + r.me.y);
                if(r.currentJob.code === constants.PILGRIM_JOBS.BUILD_CHURCH)
                    r.signal(util.signalCoords(r.me.x, r.me.y, constants.SIGNAL_CODE.CREATE_FRIENDLY_CHURCH), 2);
                else if(r.currentJob.code === constants.PILGRIM_JOBS.BUILD_ENEMY_CHURCH)
                    r.signal(util.signalCoords(r.me.x, r.me.y, constants.SIGNAL_CODE.CREATE_ENEMY_CHURCH), 2);
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
        return mode.travel_to_goal(r, 2, 2, r.castle_map);
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
    r.currentJob = util.decodeCoords(r.parent_building.signal);

    r.castle_map = util.BFSMap(r.map, {x: r.parent_building.x, y: r.parent_building.y}, util.getMoves(2));
    //r.resource_map = util.BFSMap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));

    r.job = r.currentJob.code;
    r.mode = constants.PILGRIM_MODE.MOVE_TO_RESOURCE;
    //r.log(r.currentJob.code);
    if (r.job === constants.PILGRIM_JOBS.BUILD_ENEMY_CHURCH) {
        r.log("building enemy church");
        r.safety_map = util.safetyMap(r, [util.getReflectedCoord({x: r.parent_building.x, y: r.parent_building.y}, r)]);
        // for(let i=0;i<r.map.length;i++){
        //     let s = "";
        //     for(let j=0;j<r.map.length;j++){
        //         s += (r.safety_map[i][j] ? "1" : "0");
        //     }
        //     r.log(s);
        // }
        let goal_pos = util.getNearestResourceTile2(r, {x: r.currentJob.x, y: r.currentJob.y});
        r.resource_map = util.BFSMap(r.safety_map, {x: goal_pos.x, y: goal_pos.y}, util.getMoves(2));
    } else if (r.job === constants.PILGRIM_JOBS.BUILD_CHURCH) {
        r.log('building friendly church');
        let goal_pos = util.getNearestResourceTile2(r, {x: r.currentJob.x, y: r.currentJob.y});
        r.resource_map = util.BFSMap(r.map, {x: goal_pos.x, y: goal_pos.y}, util.getMoves(2));
    } else if (r.job === constants.PILGRIM_JOBS.OFFENSIVE) {
        r.mode = constants.PILGRIM_MODE.MOVE_OFFENSIVE;
        r.builtOffensiveChurch = false;
        r.castle_loc = {x: r.currentJob.x, y: r.currentJob.y};
        r.goal_pos = util.offensivePilgrimGoal(r, r.castle_loc);
        r.resource_map = util.BFSMap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));
    } else if (r.job === constants.PILGRIM_JOBS.BUILD_WALL) {
        r.mode = constants.PILGRIM_MODE.MOVE_OFFENSIVE;
        r.resource_map = util.BFSMap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));
        r.starting_pos = {x: r.me.x, y: r.me.y};
    } else if (r.job === constants.PILGRIM_JOBS.BUILD_WALL_SUBSEQUENT) {
        r.mode = constants.PILGRIM_MODE.MOVE_OFFENSIVE;
        r.lastChurchPos = {x: r.currentJob.x, y: r.currentJob.y};
        r.desiredPos = wallutil.wallLocationSubsequent(r, {x: r.currentJob.x, y: r.currentJob.y});
        r.resource_map = util.BFSMap(r.map, {x: r.desiredPos.x, y: r.desiredPos.y}, util.getMoves(2));
        r.starting_pos = {x: r.me.x, y: r.me.y};
    } else {
        r.resource_map = util.BFSMap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));
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


    if(r.currentJob.code === constants.PILGRIM_JOBS.OFFENSIVE) return;


    // if (combat.enemyCombatInRange(r)) {
    //     //r.log("CHANGE MODE to FLEE");
    //     r.mode = constants.PILGRIM_MODE.FLEE;
    // } else if (r.mode === constants.PILGRIM_MODE.FLEE){
    //     //r.log("CHANGE MODE to MINING");
    //     r.mode = constants.PILGRIM_MODE.MOVE_TO_RESOURCE;
    // }
}
export function flee(r) {
    let damageMap = combat.damageMap(r);
    //r.log(damageMap);
    let moves = util.getMoves(2);

    //r.log(moves);
    if (damageMap[r.me.y][r.me.x] === 0) return;
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
    if(r.mode === constants.PILGRIM_MODE.MOVE_OFFENSIVE && (combat.enemyInRange(r) || r.resource_map[r.me.y][r.me.x] === 99) && r.karbonite > 50 && r.fuel > 200) {
        //made it all the way through
        r.mode = constants.PILGRIM_MODE.SCOUT;
        r.log("building offensive church");
        if(r.job === constants.PILGRIM_JOBS.BUILD_WALL) {
            r.scout_destination = wallutil.scoutDestination(r, {x: r.currentJob.x, y: r.currentJob.y});
            r.goal_map = util.BFSMap(wallutil.safetyMap(r), r.scout_destination, util.getMoves(2));

            r.signal(util.signalCoords(r.currentJob.x, r.currentJob.y, constants.SIGNAL_CODE.CREATE_OFFENSIVE_CHURCH), 2);

            r.church_pos = wallutil.freeOffensiveChurch(r);
            return r.buildUnit(SPECS.CHURCH, r.church_pos.x - r.me.x, r.church_pos.y - r.me.y);
        } else if(r.job === constants.PILGRIM_JOBS.BUILD_WALL_SUBSEQUENT) {
            //what is left
            r.scout_destination = {x: r.lastChurchPos.x, y: r.lastChurchPos.y};
            r.goal_map = util.BFSMap(wallutil.safetyMap(r), r.scout_destination, util.getMoves(2));

            r.signal(util.signalCoords(r.currentJob.x, r.currentJob.y, constants.SIGNAL_CODE.CREATE_OFFENSIVE_CHURCH), 2);

            r.church_pos = wallutil.freeOffensiveChurch(r);
            return r.buildUnit(SPECS.CHURCH, r.church_pos.x - r.me.x, r.church_pos.y - r.me.y);
        }
    }
    //r.log(r.me.x + ", " + r.me.y);
    if(r.me.x !== r.currentJob.x || r.me.y !== r.currentJob.y)
        return mode.travel_to_goal(r, 2, 2, r.resource_map);
}

function scoutStep(r) {
    let church_dist = (r.church_pos.x - r.scout_destination.x) ** 2 + (r.church_pos.y - r.scout_destination.y) ** 2;


    if((r.me.x - r.scout_destination.x) ** 2 + (r.me.y - r.scout_destination.y) ** 2 > 2) {
        r.signal(util.signalCoords(r.me.x, r.me.y, constants.SIGNAL_CODE.SCOUT_INFO), church_dist);
        return mode.travel_to_goal(r, 1, 2, r.goal_map);
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
        case constants.PILGRIM_MODE.SCOUT:
            return scoutStep(r);
            break;
    }
}