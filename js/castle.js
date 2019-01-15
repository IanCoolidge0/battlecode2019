import * as util from "./util.js"
import {SPECS} from 'battlecode';


function build_unit(r,unit_type,target_x,target_y,job) {


}

function init(r) {
    r.size = r.map.size;
    r.numOfCastle = r.getVisibleRobots().length;
    r.HSymm = util.isHorizontallySymm(r);
    r.enemy_castle = util.getReflectedCoord([r.me.x, r.me.y], r);
    r.karboniteCoords = util.resourceCoords(r.map, r.karbonite_map, [r.me.x, r.me.y], util.getMoves(2));
    r.fuelCoords = util.resourceCoords(r.map, r.fuel_map, [r.me.x, r.me.y], util.getMoves(2));
    r.createdRobots = {};
    //r.log(SPECS);

}


export function castle_step(r) {

    if (r.step === 0) {
        init(r);
    } else if (r.step > 0) {

    }

}