import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';
import * as mode from "./mode.js";
import * as combat from "./combat.js";


function init(r) {
    r.size = r.map.length;

    r.castleTalk(constants.INIT_CASTLETALK);

    r.parent_castle = util.findParentCastle(r);
    r.parent_castle_coords = {x:r.parent_castle.x,y:r.parent_castle.y};
    r.currentJob = util.decodeCoords(r.parent_castle.signal);
    //r.log(r.currentJob);
    if(r.currentJob.code === constants.PROPHET_JOBS.REINFORCE_PILGRIM) {
        r.mode = constants.PROPHET_MODE.PATH_TO_GOAL;
        r.goal_map = util.BFSMap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));
    }
    if(r.currentJob.code === constants.PROPHET_JOBS.DEFEND_GOAL) {
        r.mode = constants.PROPHET_MODE.PATH_TO_GOAL;
        r.goal_map = util.BFSMap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));
    }
}


export function step(r) {

    if (r.fuel < 300) return;
    if (r.mode !== constants.PROPHET_MODE.ATTACK && combat.enemyInRange(r)) {
        r.log("CHANGE MODE TO ATTACK");
        r.mode = constants.PROPHET_MODE.ATTACK;
    } else if (r.mode !== constants.PROPHET_MODE.DEFEND && r.me.x === r.currentJob.x && r.me.y === r.currentJob.y) {
        //r.log("CHANGE MODE TO DEFEND");
        r.mode = constants.PROPHET_MODE.DEFEND;
    } else if (r.mode !== constants.PROPHET_MODE.PATH_TO_GOAL && (r.me.x !== r.currentJob.x || r.me.y !== r.currentJob.y)) {
        //r.log("CHANGE MODE TO PATH TO GOAL");
        r.mode = constants.PROPHET_MODE.PATH_TO_GOAL;
    }




    if (r.mode === constants.PROPHET_MODE.PATH_TO_GOAL) {
        return mode.travel_to_goal(r,2,2,r.goal_map);
    }
    if (r.mode === constants.PROPHET_MODE.DEFEND) {
        return;
    }
    if (r.mode === constants.PROPHET_MODE.ATTACK) {
        r.log("parent");
        r.log(r.parent_castle_coords);
        return mode.prophet_attack(r,r.parent_castle_coords);
    }



}

function reinforceStep(r) {
    let visible = r.getVisibleRobots();

    for(let i=0;i<visible.length;i++) {
        if((r.me.x - visible[i].x) ** 2 + (r.me.y - visible[i].y) ** 2 <= 64) {
            return r.attack(visible[i].x - r.me.x, visible[i].y - r.me.y);
        }
    }
}

function pathToGoalStep(r) {
    let visible = r.getVisibleRobots();

    for(let i=0;i<visible.length;i++) {
        if((r.me.x - visible[i].x) ** 2 + (r.me.y - visible[i].y) ** 2 <= 64) {
            return r.attack(visible[i].x - r.me.x, visible[i].y - r.me.y);
        }
    }

    if((r.me.x - r.currentJob.x) ** 2 + (r.me.y - r.currentJob.y) ** 2 >= 2) {
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
        if(r.currentJob.code === constants.PROPHET_JOBS.REINFORCE_RESOURCE) {
            r.mode = constants.PROPHET_MODE.REINFORCE;
        }
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