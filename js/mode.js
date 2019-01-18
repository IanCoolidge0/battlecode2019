import * as util from "./util.js";
import {SPECS} from 'battlecode';


export function travel_to_goal(r,radius,tolerance,goalMap) {
    let dir = goalMap[r.me.y][r.me.x];
    return util.fuzzyMove(r,-dir.x,-dir.y,radius,tolerance);
}

export function defend_goal(r) {

}
