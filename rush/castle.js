import * as util from "./util.js"
import {SPECS} from 'battlecode';

function build(r, unit) {
    let dir_coord = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
    let pass_map = r.map;
    let visible_map = r.getVisibleRobotMap();

    for(let i=0;i<dir_coord.length;i++) {
        let move = dir_coord[i];
        if(pass_map[r.me.y + move[1]][r.me.x + move[0]] === true && visible_map[r.me.y + move[1]][r.me.x + move[0]] === 0) {
            r.log("built a pilgrim");
            return r.buildUnit(unit, move[0], move[1]);
        }
    }
}

export function castle_step(r) {
    if(r.step < 3) {
        return build(r, SPECS.PREACHER);
    }
}