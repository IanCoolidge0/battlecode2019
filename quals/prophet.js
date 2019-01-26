import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';
import * as mode from "./mode.js";
import * as combat from "./combat.js";


function init(r) {
    r.size = r.map.length;
    r.moves = util.getMoves(2);
    r.wait = 0;
    r.castleTalk(constants.INIT_CASTLETALK);

    r.parent_castle = util.findParentCastle(r);
    r.parent_castle_coords = {x:r.parent_castle.x,y:r.parent_castle.y};
    r.currentJob = util.decodeCoords(r.parent_castle.signal);
    //r.log(r.currentJob);

    if(r.currentJob.code === constants.PROPHET_JOBS.DEFEND_GOAL) {
        r.mode = constants.PROPHET_MODE.PATH_TO_GOAL;
        r.moves = util.getMoves2(2);

        r.goal_map = util.BFSMap_with_rmap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, r.moves, r);

    }
    if (r.currentJob.code < 8) {
        r.mode = constants.PROPHET_MODE.DEFEND_CASTLE;
        r.wait = 5;
        r.moves = util.getMoves(2);
        r.goal_map = util.BFSMap_with_rmap(r.map,{x: r.currentJob.x, y: r.currentJob.y}, r.moves, r);
        return mode.travel_to_goal5(r,r.moves);
    }
}


export function step(r) {
    if (r.mode === constants.PROPHET_MODE.DEFEND_CASTLE) {
        if (r.wait === 0) {
            r.mode = constants.PROPHET_MODE.PATH_TO_GOAL;
        }
        r.wait--;
        return mode.prophet_attack(r,r.parent_castle_coords);

    }

    let distance_to_goal = (r.me.x - r.currentJob.x) + (r.me.y - r.currentJob.y);
    if (r.fuel < 300) return;
    /*if (r.mode !== constants.PROPHET_MODE.ATTACK && combat.enemyInRange(r)) {
        //r.log("CHANGE MODE TO ATTACK");
        r.mode = constants.PROPHET_MODE.ATTACK;
    } else */if (r.mode !== constants.PROPHET_MODE.DEFEND &&
        r.currentJob.x === r.me.x && r.currentJob.y === r.me.y) {
        //r.log("CHANGE MODE TO DEFEND");
        r.mode = constants.PROPHET_MODE.DEFEND;
    } else if (r.mode !== constants.PROPHET_MODE.PATH_TO_GOAL && distance_to_goal > 1) {
        //r.log("CHANGE MODE TO PATH TO GOAL");
        r.mode = constants.PROPHET_MODE.PATH_TO_GOAL;
    }

    if (r.mode === constants.PROPHET_MODE.PATH_TO_GOAL) {
        //r.log('moving');
        return mode.travel_to_goal5(r,r.moves);
    }
    if (r.mode === constants.PROPHET_MODE.DEFEND) {
        return;
    }
    if (r.mode === constants.PROPHET_MODE.ATTACK) {
        //r.log("parent");
        //r.log(r.parent_castle_coords);
        return mode.prophet_attack(r,r.parent_castle_coords);
    }




}



export function prophet_step(r) {
    if (r.step === 0) {
        init(r);
    } else
        r.castleTalk(124);
    return step(r);
    // switch(r.mode) {
    //     case constants.PROPHET_MODE.PATH_TO_GOAL:
    //         return pathToGoalStep(r);
    //         break;
    // }


    // switch(r.mode) {
    //     case constants.PROPHET_MODE.PATH_TO_GOAL:
    //         return pathToGoalStep(r);
    //         break;
    //     case constants.PROPHET_MODE.REINFORCE:
    //         return reinforceStep(r);
    //         break;
    // }
}