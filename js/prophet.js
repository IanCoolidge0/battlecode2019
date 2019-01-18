import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';

function init(r) {
    r.castleTalk(constants.INIT_CASTLETALK);

    r.parent_castle = util.findParentCastle(r);
    r.currentJob = util.decodeCoords(r.parent_castle.signal);

    if(r.currentJob.code === constants.PROPHET_JOBS.REINFORCE_RESOURCE) {
        r.goal_map = util.BFSMap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));
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
    }

    switch(r.mode) {
        case constants.PROPHET_MODE.PATH_TO_GOAL:
            return pathToGoalStep(r);
            break;
        case constants.PROPHET_MODE.REINFORCE:
            return reinforceStep(r);
            break;
    }
}