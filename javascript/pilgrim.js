import * as util from "./util.js"
import {SPECS} from 'battlecode';

var MODE = {
  PATH_TO_RESOURCE: 0,
  MINE: 1,
  PATH_TO_CASTLE: 2
};

export function pilgrim_step(r) {
    let visible = r.getVisibleRobots();

    if(r.step === 0) {
        r.parent_castle = 0;
        for(let i=0;i<visible.length;i++) {
            if(visible[i].unit === SPECS.CASTLE) {
                r.parent_castle = visible[i];
            }
        }

        r.start = [r.me.x, r.me.y];
        r.castleOffset = [r.me.x - r.parent_castle.x, r.me.y - r.parent_castle.y];
        r.goal = util.decodeCoords(r.parent_castle.signal);

        r.pathMapToKarb = util.pathfindingMap(r.map, r.goal, util.getMoves(2), r);
        r.pathMapToStart = util.pathfindingMap(r.map, r.start, util.getMoves(2), r)

        r.mode = MODE.PATH_TO_RESOURCE;
    }

    let rmap = r.getVisibleRobotMap();
    for(let i=0;i<visible.length;i++) {
        if(visible[i].team !== r.me.team && (visible[i].unit === SPECS.CRUSADER || visible[i].unit === SPECS.PROPHET || visible[i].unit === SPECS.PREACHER)) {
            //run away little girl run away
            r.castleTalk(3);

            let direction = util.directionTo(r.me.x, r.me.y, visible[i].x, visible[i].y, r);
            if(direction === undefined)
                r.log(r.me.x + " " + r.me.y + " " + visible[i].x + " " + visible[i].y);

            let newX = r.me.x - direction[0];
            let newY = r.me.y - direction[1];

            if(util.withInMap(newX, newY, r) && rmap[newY][newX] === 0) {
                return r.move(-direction[0], -direction[1]);
            }

            return util.fuzzy_move(r, -direction[0], -direction[1], 3);
        }
    }

    if(r.mode === MODE.PATH_TO_RESOURCE) {

        if(r.needs_new_assignment) {
            r.goal = util.decodeCoords(r.parent_castle.signal);
            r.needs_new_assignment = false;
        } else {

            if (r.me.x !== r.goal[0] || r.me.y !== r.goal[1]) {
                let rmap = r.getVisibleRobotMap();

                if (rmap[r.goal[1]][r.goal[0]] > 0) {
                    if (r.getRobot(rmap[r.goal[1]][r.goal[0]]).unit === SPECS.PILGRIM) {
                        r.needs_new_assignment = true;
                        r.mode = MODE.PATH_TO_CASTLE;
                    }
                }

                if(r.pathMapToKarb[r.me.y][r.me.x] === 0) {
                    r.log(r.me.x + " " + r.me.y);
                }

                let dx = r.pathMapToKarb[r.me.y][r.me.x][0];
                let dy = r.pathMapToKarb[r.me.y][r.me.x][1];

                let newX = r.me.x - dx;
                let newY = r.me.y - dy;

                if (util.withInMap(newX, newY, r) && rmap[newY][newX] === 0) {
                    return r.move(-dx, -dy);
                }

                return util.fuzzy_move(r, -dx, -dy, 3);

            } else {
                if(r.me.karbonite >= 18) {
                    r.mode = MODE.PATH_TO_CASTLE;
                }

                return r.mine();
            }
        }
    } else if(r.mode === MODE.PATH_TO_CASTLE) {

        if (r.me.x !== r.start[0] || r.me.y !== r.start[1]) {
            let rmap = r.getVisibleRobotMap();

            let dx = r.pathMapToStart[r.me.y][r.me.x][0];
            let dy = r.pathMapToStart[r.me.y][r.me.x][1];

            let newX = r.me.x - dx;
            let newY = r.me.y - dy;

            if(util.withInMap(newX, newY, r) && rmap[newY][newX] === 0) {
                return r.move(-dx, -dy);
            }

            return util.fuzzy_move(r, -dx, -dy, 3);

        } else {
            // at goal
            r.mode = MODE.PATH_TO_RESOURCE;

            if(r.needs_new_assignment)
                r.signal(1, 2);

            return r.give(-r.castleOffset[0], -r.castleOffset[1], r.me.karbonite, 0);
        }
    }
}