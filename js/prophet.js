import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';
import * as mode from "./mode.js";

function init(r) {
    r.size = r.map.length;
    r.mode = constants.PROPHET_MODE.DEFEND_GOAL;
    r.castleTalk(constants.INIT_CASTLETALK);

    r.parent_castle = util.findParentCastle(r);
    r.currentJob = util.decodeCoords(r.parent_castle.signal);
    //r.log(r.currentJob);
    if(r.currentJob.code === constants.PROPHET_JOBS.REINFORCE_PILGRIM) {
        r.goal_map = util.BFSMap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));
    }
    if(r.currentJob.code === constants.PROPHET_JOBS.DEFEND_GOAL) {
        r.mode = constants.PROPHET_MODE.PATH_TO_GOAL;
        r.goal_map = util.BFSMap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));
    }
}


export function step(r) {
    if (r.mode !== constants.PROPHET_MODE.DEFEND && r.me.x === r.currentJob.x && r.me.y === r.currentJob.y) {
        r.mode = constants.PROPHET_MODE.DEFEND;
    }
    if (r.mode === constants.PROPHET_MODE.PATH_TO_GOAL) {
        return mode.travel_to_goal(r,2,2,r.goal_map);
    }
    if (r.mode === constants.PROPHET_MODE.DEFEND) {

    }

}
function pathToGoalStep(r) {

}

export function prophet_step(r) {
    if (r.step === 0) {
        init(r);
    }
    return step(r);
    // switch(r.mode) {
    //     case constants.PROPHET_MODE.PATH_TO_GOAL:
    //         return pathToGoalStep(r);
    //         break;
    // }
}