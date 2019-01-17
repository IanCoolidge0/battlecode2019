import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';

function init(r) {
    r.castleTalk(constants.INIT_CASTLETALK);

    r.parent_castle = util.findParentCastle(r);
    r.currentJob = util.decodeCoords(r.parent_castle.signal);

    if(r.currentJob.code === constants.PROPHET_JOBS.REINFORCE_PILGRIM) {
        r.goal_map = util.BFSMap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));
    }
}

function pathToGoalStep(r) {

}

export function prophet_step(r) {
    if (step === 0) {
        init(r);
    }

    switch(r.mode) {
        case constants.PROPHET_MODE.PATH_TO_GOAL:
            return pathToGoalStep(r);
            break;
    }
}