import * as util from "./util.js"
import {SPECS} from 'battlecode';

export function castle_step(r) {
    if(r.step == 0) {
        r.karboniteCoords = util.karboniteCoords(r.map, r.karbonite_map, [r.me.x, r.me.y], util.getMoves(2));
        r.initial_pilgrim_count = 0;
    }

    if(r.step < 2) {
        r.signal(util.signalCoords(r.karboniteCoords[r.initial_pilgrim_count][0], r.karboniteCoords[r.initial_pilgrim_count][1]), 2);
        r.initial_pilgrim_count += 1;
        return r.buildUnit(SPECS.PILGRIM, 1, 1);
    }
}