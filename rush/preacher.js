import {SPECS} from 'battlecode';
import * as util from "./util.js";

function fuzzy_move(r, dx, dy) {
    let rmap = r.getVisibleRobotMap();

    for(let i=1;i<4;i++) {
        let leftMove = util.rotateLeft([dx, dy], i, 2);

        let newX = r.me.x + leftMove[0];
        let newY = r.me.y + leftMove[1];

        if(rmap[newY][newX] === 0 && r.map[newY][newX] === true)
            return r.move(leftMove[0], leftMove[1]);

        let rightMove = util.rotateRight([dx, dy], i, 2);

        newX = r.me.x + rightMove[0];
        newY = r.me.y + rightMove[1];

        if(rmap[newY][newX] === 0 && r.map[newY][newX] === true)
            return r.move(rightMove[0], rightMove[1]);
    }
}

export function preacher_step(r) {
    if(r.step === 0) {
        r.goal = util.getReflectedCoord([r.me.x, r.me.y], r);
        r.log("goal: " + r.goal);
        r.pathMapToStart = util.pathfindingMap(r.map, r.goal, util.getMoves(2), r);
        r.atCastle = false;
        r.castleOffset = [0,0];
    }

    let visible = r.getVisibleRobots();
    for(let i=0;i<visible.length;i++) {
        let other = visible[i];
        if(other.unit === SPECS.CASTLE && other.team !== r.me.team && (r.me.x - other.x) ** 2 + (r.me.y - other.y) ** 2 <= 16) {
            r.atCastle = true;
            r.castleOffset = [r.me.x - other.x, r.me.y - other.y];
            break;
        }
    }

    if (!r.atCastle) {
        let rmap = r.getVisibleRobotMap();

        let dx = r.pathMapToStart[r.me.y][r.me.x][0];
        let dy = r.pathMapToStart[r.me.y][r.me.x][1];

        let newX = r.me.x - dx;
        let newY = r.me.y - dy;

        if(rmap[newY][newX] === 0) {
            return r.move(-dx, -dy);
        }

        return fuzzy_move(r, -dx, -dy);

    } else {
        return r.attack(-r.castleOffset[0], -r.castleOffset[1]);
    }
}