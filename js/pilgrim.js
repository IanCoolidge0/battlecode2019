import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';

function moveToResourceStep(r) {

}

function mineResourceStep(r) {

}

function moveToCastleStep(r) {

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