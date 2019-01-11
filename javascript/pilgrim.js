import * as util from "./util.js"
import {SPECS} from 'battlecode';

var MODE = {
  PATH_TO_RESOURCE: 0,
  MINE: 1,
  PATH_TO_CASTLE: 2
};

export function pilgrim_step(r) {
    if(r.step == 0) {
        let visible = r.getVisibleRobots();

        let parent_castle = 0;
        for(let i=0;i<visible.length;i++) {
            if(visible[i].unit == SPECS.CASTLE) {
                parent_castle = visible[i];
            }
        }

        r.start = [r.me.x, r.me.y];
        r.goal = util.decodeCoords(parent_castle.signal);

        r.pathMapToKarb = util.pathfindingMap(r.map, r.goal, util.getMoves(2), r);
        r.pathMapToStart = util.pathfindingMap(r.map, r.start, util.getMoves(2), r)

        r.mode = MODE.PATH_TO_RESOURCE;
    }

    if(r.mode === MODE.PATH_TO_RESOURCE) {

        if (r.me.x != r.goal[0] || r.me.y != r.goal[1]) {
            let dx = r.pathMapToKarb[r.me.y][r.me.x][0];
            let dy = r.pathMapToKarb[r.me.y][r.me.x][1];

            let newX = r.me.x - dx;
            let newY = r.me.y - dy;

            if(r.getVisibleRobotMap()[newY][newX] === 0) {
                return r.move(-dx, -dy);
            } else {
                let move = util.getMoves(2)[Math.floor(Math.random() * 12)]
                return r.move(move[0], move[1]);
            }

        } else {
            r.mode = MODE.MINE;
        }

    } else if(r.mode === MODE.MINE) {

        if(r.me.karbonite >= 18) {
            r.mode = MODE.PATH_TO_CASTLE;
        }

        return r.mine();

    } else if(r.mode === MODE.PATH_TO_CASTLE) {

        if (r.me.x != r.start[0] || r.me.y != r.start[1]) {
            let dx = r.pathMapToStart[r.me.y][r.me.x][0];
            let dy = r.pathMapToStart[r.me.y][r.me.x][1];

            let newX = r.me.x - dx;
            let newY = r.me.y - dy;

            if(r.getVisibleRobotMap()[newY][newX] === 0) {
                return r.move(-dx, -dy);
            } else {
                let move = util.getMoves(2)[Math.floor(Math.random() * 12)]
                return r.move(move[0], move[1]);
            }

        } else {
            // at goal
            r.mode = MODE.PATH_TO_RESOURCE;
            return r.give(-1, -1, 20, 0);
        }
    }
}