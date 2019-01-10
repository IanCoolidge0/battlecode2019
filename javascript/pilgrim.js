import * as util from "./util.js"
import {SPECS} from 'battlecode';

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
    }

    if(r.pathPosition < r.path.length) {
        let dx = r.path[r.pathPosition][0];
        let dy = r.path[r.pathPosition][1];

        let newX = r.me.x + dx;
        let newY = r.me.y + dy;

        if(r.getVisibleRobotMap()[newY][newX] === 0) {
            r.pathPosition++;
            return r.move(dx, dy);
        }
    }

}