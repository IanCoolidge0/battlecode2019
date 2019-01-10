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

        r.goal = util.decodeCoords(parent_castle.signal);
        r.path = util.pathTo(r.map, [r.me.x, r.me.y], r.goal, util.getMoves(2), r);
        r.pathPosition = 0;
        r.mode = MODE.PATH_TO_RESOURCE;
    }

    if(r.mode === MODE.PATH_TO_RESOURCE) {

        if (r.pathPosition < r.path.length) {
            let dx = r.path[r.pathPosition][0];
            let dy = r.path[r.pathPosition][1];

            let newX = r.me.x + dx;
            let newY = r.me.y + dy;

            if (r.getVisibleRobotMap()[newY][newX] === 0) {
                r.pathPosition++;
                return r.move(dx, dy);
            }
        }

        if(r.pathPosition === r.path.length) {
            r.pathPosition = r.path.length - 1;
            r.mode = MODE.MINE;
        }

    } else if(r.mode === MODE.MINE) {

        if(r.me.karbonite >= 18) {
            r.mode = MODE.PATH_TO_CASTLE;
        }

        return r.mine();

    } else if(r.mode === MODE.PATH_TO_CASTLE) {

        if(r.pathPosition >= 0) {
            let dx = r.path[r.pathPosition][0];
            let dy = r.path[r.pathPosition][1];

            let newX = r.me.x - dx;
            let newY = r.me.y - dy;

            if (r.getVisibleRobotMap()[newY][newX] === 0) {
                r.pathPosition--;
                return r.move(-dx, -dy);
            }
        }

        if(r.pathPosition === -1) {
            r.mode = MODE.PATH_TO_RESOURCE;
            r.pathPosition = 0;
            return r.give(-1, -1, 20, 0);
        }
    }
}