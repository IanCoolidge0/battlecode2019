import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';
import * as combat from "./combat.js";
import * as mode from "./mode.js";

function moveToResourceStep(r) {
    if(r.currentJob.code === constants.PILGRIM_JOBS.BUILD_CHURCH || r.currentJob.code === constants.PILGRIM_JOBS.BUILD_ENEMY_CHURCH) {
        let dist = (r.me.x - r.currentJob.x) ** 2 + (r.me.y - r.currentJob.y) ** 2;
        if(dist <= 2 && dist > 0) {
            if (r.karbonite > 50 && r.fuel > 200) {
                r.log("building church at (" + r.currentJob.x + "," + r.currentJob.y + ")");

                let church_pos = {x: r.currentJob.x, y: r.currentJob.y};
                r.mode = constants.PILGRIM_MODE.MOVE_TO_RESOURCE;
                r.currentJob = util.getNearestResourceTile(r);

                r.my_church = {x: church_pos.x, y: church_pos.y};
                r.castle_map = util.BFSMap(r.map, {x: r.my_church.x, y: r.my_church.y}, util.getMoves(2));
                r.resource_map = util.BFSMap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));

                r.signal(util.signalCoords(r.currentJob.x, r.currentJob.y, 5), 2);

                return r.buildUnit(SPECS.CHURCH, church_pos.x - r.me.x, church_pos.y - r.me.y);
            } else {
                return;
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

    if(r.me.x !== r.currentJob.x || r.me.y !== r.currentJob.y) {
        return mode.travel_to_goal(r, 2, 2, r.resource_map);
    } else {
        r.mode = constants.PILGRIM_MODE.MINE_RESOURCE;
        return r.mine();
    }
}

function searchForChurch(r, deposit_radius) {
    let visible = r.getVisibleRobots();
    for(let i=0;i<visible.length;i++) {
        if(visible[i].unit === SPECS.CHURCH && (r.me.x - visible[i].x) ** 2 + (r.me.y - visible[i].y) ** 2 <= deposit_radius ** 2) {
            r.my_church = {x: visible[i].x, y: visible[i].y};
            r.castle_map = util.BFSMap(r.map, {x: r.my_church.x, y: r.my_church.y}, util.getMoves(2));
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

    if(r.currentJob.code === constants.PILGRIM_JOBS.MINE_KARBONITE && r.me.karbonite >= 18) {
        if(r.my_church === undefined)
            searchForChurch(r, 5);

        r.mode = constants.PILGRIM_MODE.MOVE_TO_CASTLE;
    }

    if(r.currentJob.code === constants.PILGRIM_JOBS.MINE_FUEL && r.me.fuel >= 90) {
        if(r.my_church === undefined)
            searchForChurch(r, 5);

        r.mode = constants.PILGRIM_MODE.MOVE_TO_CASTLE;
    }

    return r.mine();
}

function moveToCastleStep(r) {
    let px = (r.my_church === undefined) ? r.parent_castle.x : r.my_church.x;
    let py = (r.my_church === undefined) ? r.parent_castle.y : r.my_church.y;

    if((r.me.x - px) ** 2 + (r.me.y - py) ** 2 > 2) {
        return mode.travel_to_goal(r, 2, 2, r.castle_map);
    } else {
        r.mode = constants.PILGRIM_MODE.MOVE_TO_RESOURCE;

        let dx = px - r.me.x;
        let dy = py - r.me.y;

        if(r.currentJob.code === constants.PILGRIM_JOBS.MINE_KARBONITE)
            return r.give(dx, dy, r.me.karbonite, 0);
        else if(r.currentJob.code === constants.PILGRIM_JOBS.MINE_FUEL)
            return r.give(dx, dy, 0, r.me.fuel);
    }
}

function init(r) {
    r.last_mode = constants.PILGRIM_MODE.MOVE_TO_RESOURCE;
    r.castleTalk(constants.INIT_CASTLETALK);

    r.parent_castle = util.findParentCastle(r);
    r.currentJob = util.decodeCoords(r.parent_castle.signal);

    r.castle_map = util.BFSMap(r.map, {x: r.parent_castle.x, y: r.parent_castle.y}, util.getMoves(2));
    r.resource_map = util.BFSMap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));

    r.job = r.currentJob.code;
    r.mode = constants.PILGRIM_MODE.MOVE_TO_RESOURCE;

    if(r.job === constants.PILGRIM_JOBS.BUILD_ENEMY_CHURCH) {
        r.log("building enemy church");
        r.safety_map = util.safetyMap(r, [util.getReflectedCoord({x: r.parent_castle.x, y: r.parent_castle.y}, r)]);
        // for(let i=0;i<r.map.length;i++){
        //     let s = "";
        //     for(let j=0;j<r.map.length;j++){
        //         s += (r.safety_map[i][j] ? "1" : "0");
        //     }
        //     r.log(s);
        // }
        r.resource_map = util.BFSMap(r.safety_map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));
    }

    r.requestedReinforcements = false;
    r.my_church = undefined;
}


export function isEndangered(r) {

    // if( combat.enemyCombatInRange(r)) {
    //
    //     r.log(r.getVisibleRobots());
    //     let damageMap = combat.damageMap2(r);
    //     r.log(damageMap);
    // }





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

    }
}