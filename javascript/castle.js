import * as util from "./util.js"
import {SPECS} from 'battlecode';

function build(r, unit) {
    let dir_coord = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
    let pass_map = r.map;
    let visible_map = r.getVisibleRobotMap();

    for(let i=0;i<dir_coord.length;i++) {
        let move = dir_coord[i];
        if(pass_map[r.me.y + move[1]][r.me.x + move[0]] === true && visible_map[r.me.y + move[1]][r.me.x + move[0]] === 0)
            return r.buildUnit(unit, move[0], move[1]);
    }
}

export function castle_step(r) {
    if(r.step === 0) {
        r.karboniteCoords = util.karboniteCoords(r.map, r.karbonite_map, [r.me.x, r.me.y], util.getMoves(2));
        r.initial_pilgrim_complete = false;
        r.initial_pilgrim_count = 0;
        r.castleCount = r.getVisibleRobots().length;

    } else if(!r.initial_pilgrim_complete) {
        let target = r.karboniteCoords[r.initial_pilgrim_count];

        if(r.getVisibleRobots().length - r.castleCount === 4 || (target[0] - r.me.x) ** 2 + (target[1] - r.me.y) ** 2 > 64) {
            r.initial_pilgrim_complete = true;
        } else {
            r.signal(util.signalCoords(target[0], target[1]), 2);
            r.initial_pilgrim_count++;
            return build(r, SPECS.PILGRIM);
        }
    }
}