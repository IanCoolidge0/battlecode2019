import {SPECS} from 'battlecode';
import * as util from "./util.js";

function defenseInit(r) {
    let robots = r.getVisibleRobots();
    for (let i = 0;i <  robots.length;i++) {
        if (robots[i].unit === SPECS.CASTLE) {
            r.dir = [r.me.x - robots[i].x,r.me.y - robots[i].y];
        }
    }
}

function defenseInit2(r) {
    return r.move(r.dir[0],r.dir[1]);
}

function defense_step(r) {
    let robotMap = r.getVisibleRobotMap();
    let attackRange = util.getMoves(4);
    for (let i = 0;i < attackRange.length;i++) {
        let id = robotMap[r.me.y + attackRange[i][1]][r.me.x + attackRange[i][0]];
        if (id <= 0 || id === undefined) continue;

        let other_r = r.getRobot(id);

        if (r.me.team !== other_r.team) {
            return r.attack(attackRange[i][0],attackRange[i][1]);
        }
    }
}

export function preacher_step(r) {
    if(r.step === 0)
        defenseInit(r);
    else if(r.step === 1)
        defenseInit2(r);

    return defense_step(r);
}