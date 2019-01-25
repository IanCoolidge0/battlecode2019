import * as util from "./util.js";
import {SPECS} from 'battlecode';
import * as combat from "./combat.js";



export function travel_to_goal(r,radius,tolerance,goalMap) {
    let dir = goalMap[r.me.y][r.me.x];

    return util.fuzzyMove(r,-dir.x,-dir.y,radius,tolerance);
}
export function travel_to_goal5(r,moves) {
    if (r.wait == undefined) r.wait = 0;
    let rmap = r.getVisibleRobotMap();
    let move = r.goal_map[r.me.y][r.me.x];
    //r.log('position ' + r.me.x + ', ' + r.me.y);

    //r.log(move);

    if (move === 0 && move == 99) {
        r.wait++;
        return;
    }

    let next = {x:r.me.x - move.x,y:r.me.y - move.y};
    //r.log(next);
    if (rmap[next.y][next.x] === 0) {
        //r.log("SOMEONE IS AT: " + next.y + ", " + next.x);
        r.wait = 0;
        return r.move(-move.x,-move.y);
    } else if (r.wait > 5 && r.me.time > 100) {
        //r.log("REROUTING to" + r.currentJob.x + ', ' + r.currentJob.y);
        r.wait = 0;
        r.goal_map = util.BFSMap_with_rmap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, moves,r);
    } else {
        r.wait++;
    }
}

export function defend(r) {

}

export function attack(r,unit) {
    const attack = combat.simple_attack(r,unit);
    return r.attack(attack.x,attack.y);
}

export function prophet_attack(r,castleCoords) {
    // let damageMap = combat.damageMap(r);
    // //r.log("damage to me: " + damageMap[r.me.y][r.me.x]);
    //
    // return combat.prophet_kiting(r, damageMap);
    let attack = combat.attack_nearest_castle(r,SPECS.PROPHET,castleCoords);
    if (attack !== undefined)
        return r.attack(attack.x,attack.y);
}





