import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';
import * as combat from "./combat.js";
function moveToResourceStep(r) {
    if(r.me.x !== r.currentJob.x || r.me.y !== r.currentJob.y) {
        let visible_map = r.getVisibleRobotMap();

        let move = r.resource_map[r.me.y][r.me.x];
        let potential_moves = util.getFuzzyMoves(r, move.x, move.y, 2, 2);

        for(let i=0;i<potential_moves.length;i++) {
            let newX = r.me.x - potential_moves[i].x;
            let newY = r.me.y - potential_moves[i].y;

            if(newX >= 0 && newY >= 0 && newX < r.map.length && newY < r.map.length && r.map[newY][newX] && visible_map[newY][newX] === 0) {
                return r.move(-potential_moves[i].x, -potential_moves[i].y);
            }
        }
    } else {
        r.mode = constants.PILGRIM_MODE.MINE_RESOURCE;
        return r.mine();
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

    if(r.currentJob.code === constants.PILGRIM_JOBS.MINE_KARBONITE && r.me.karbonite >= 18)
        r.mode = constants.PILGRIM_MODE.MOVE_TO_CASTLE;
    if(r.currentJob.code === constants.PILGRIM_JOBS.MINE_FUEL && r.me.fuel >= 90)
        r.mode = constants.PILGRIM_MODE.MOVE_TO_CASTLE;

    return r.mine();
}

function moveToCastleStep(r) {
    if((r.me.x - r.parent_castle.x) ** 2 + (r.me.y - r.parent_castle.y) ** 2 > 2) {
        let visible_map = r.getVisibleRobotMap();

        let move = r.castle_map[r.me.y][r.me.x];
        let potential_moves = util.getFuzzyMoves(r, move.x, move.y, 2, 2);

        for(let i=0;i<potential_moves.length;i++) {
            let newX = r.me.x - potential_moves[i].x;
            let newY = r.me.y - potential_moves[i].y;

            if(newX >= 0 && newY >= 0 && newX < r.map.length && newY < r.map.length && r.map[newY][newX] && visible_map[newY][newX] === 0) {
                return r.move(-potential_moves[i].x, -potential_moves[i].y);
            }
        }
    } else {
        r.mode = constants.PILGRIM_MODE.MOVE_TO_RESOURCE;

        let dx = r.parent_castle.x - r.me.x;
        let dy = r.parent_castle.y - r.me.y;

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

    r.requestedReinforcements = false;
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