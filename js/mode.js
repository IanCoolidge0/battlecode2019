import * as util from "./util.js";
import {SPECS} from 'battlecode';
import * as combat from "./combat.js";


export function travel_to_goal(r,radius,tolerance,goalMap) {
    let dir = goalMap[r.me.y][r.me.x];
    return util.fuzzyMove(r,-dir.x,-dir.y,radius,tolerance);
}

export function defend(r) {

}

export function attack(r,unit) {
    const attack = combat.simple_attack(r,unit);
    return r.attack(attack.x,attack.y);
}

export function prophet_attack(r) {
    let damageMap = combat.damageMap(r);

    return combat.prophet_kiting(r, damageMap);
}



