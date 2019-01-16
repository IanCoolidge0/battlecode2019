import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';

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
    r.castleTalk(constants.INIT_CASTLETALK);

    r.parent_castle = util.findParentCastle(r);
    r.currentJob = util.decodeCoords(r.parent_castle.signal);

    r.castle_map = util.BFSMap(r.map, {x: r.parent_castle.x, y: r.parent_castle.y}, util.getMoves(2));
    r.resource_map = util.BFSMap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));

    r.job = r.currentJob.code;
    r.mode = constants.PILGRIM_MODE.MOVE_TO_RESOURCE;
}

export function pilgrim_step(r) {
    if (r.step === 0) {
        init(r);
    }

    switch(r.mode) {
        case constants.PILGRIM_MODE.MOVE_TO_RESOURCE:
            return moveToResourceStep(r);
            break;
        case constants.PILGRIM_MODE.MINE_RESOURCE:
            return mineResourceStep(r);
            break;
        case constants.PILGRIM_MODE.MOVE_TO_CASTLE:
            return moveToCastleStep(r);
    }
}