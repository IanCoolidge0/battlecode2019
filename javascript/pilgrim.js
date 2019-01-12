import * as util from "./util.js"
import {SPECS} from 'battlecode';

var MODE = {
  PATH_TO_RESOURCE: 0,
  MINE: 1,
  PATH_TO_CASTLE: 2
};

function fuzzy_move(r, dx, dy) {
    let rmap = r.getVisibleRobotMap();

    for(let i=1;i<4;i++) {
        let leftMove = util.rotateLeft([-dx, -dy], i, 2);
        //r.log("move" + leftMove);
        let newX = r.me.x + leftMove[0];
        let newY = r.me.y + leftMove[1];

        if(rmap[newY][newX] === 0 && r.map[newY][newX] === true)
            return r.move(leftMove[0], leftMove[1]);

        let rightMove = util.rotateRight([-dx, -dy], i, 2);

        newX = r.me.x + rightMove[0];
        newY = r.me.y + rightMove[1];

        if(rmap[newY][newX] === 0 && r.map[newY][newX] === true)
            return r.move(rightMove[0], rightMove[1]);
    }
}

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
        r.castleOffset = [r.me.x - parent_castle.x, r.me.y - parent_castle.y];
        r.goal = util.decodeCoords(parent_castle.signal);

        r.pathMapToKarb = util.pathfindingMap(r.map, r.goal, util.getMoves(2), r);
        r.pathMapToStart = util.pathfindingMap(r.map, r.start, util.getMoves(2), r)

        r.mode = MODE.PATH_TO_RESOURCE;
    }

    if(r.mode === MODE.PATH_TO_RESOURCE) {

        if (r.me.x != r.goal[0] || r.me.y != r.goal[1]) {
            let rmap = r.getVisibleRobotMap();

            let dx = r.pathMapToKarb[r.me.y][r.me.x][0];
            let dy = r.pathMapToKarb[r.me.y][r.me.x][1];

            let newX = r.me.x - dx;
            let newY = r.me.y - dy;

            if(rmap[newY][newX] === 0) {
                return r.move(-dx, -dy);
            }

            return fuzzy_move(r, dx, dy);

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
            let rmap = r.getVisibleRobotMap();

            let dx = r.pathMapToStart[r.me.y][r.me.x][0];
            let dy = r.pathMapToStart[r.me.y][r.me.x][1];

            let newX = r.me.x - dx;
            let newY = r.me.y - dy;

            if(rmap[newY][newX] === 0) {
                return r.move(-dx, -dy);
            }

            return fuzzy_move(r, dx, dy);

        } else {
            // at goal
            r.mode = MODE.PATH_TO_RESOURCE;
            return r.give(-r.castleOffset[0], -r.castleOffset[1], 20, 0);
        }
    }
}