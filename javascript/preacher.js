import {BCAbstractRobot, SPECS} from 'battlecode';
import * as util from "./util.js";

export function preacher_step(r) {

}

export function init(r) {
    let robots = r.getVisibleRobots();
    for (let i = 0;i < robots.length;i++) {

        if (robots[i].unit === SPECS.CASTLE) {
            let signal = robots[i].signal;
            r.target = util.decodeCoords(signal);
            r.log("target: " + r.target);
            break;
        }
    }
    r.movementRange = util.getMoves(2);
    //r.log("REACHED");
    r.targetBFSMap = util.BFSMap(r.map,r.target,r.movementRange,r);
    //r.log(r.targetBFSMap);



}

export function step(r) {
    //attacks first enemy
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
    let move = r.targetBFSMap[r.me.y][r.me.x];

     if (robotMap[r.me.y - move[1]][r.me.x - move[0]] === 0) {
         return r.move(-move[0],-move[1]);
     }
    r.log("move:  " + move);
    let moveL = util.rotateLeft(move,2);

    r.log("moveL1: " + moveL);
    if (0 <= r.me.y - moveL[1]  && r.me.y - moveL[1] < r.map.length && 0 < r.me.x - moveL[0] && r.me.x - moveL[0] < r.map.length)  {
        r.log("moveL: " + moveL);
        if (robotMap[r.me.y - moveL[1]][r.me.x - moveL[0]] === 0 && r.map[r.me.y - moveL[1]][r.me.x - moveL[0]]) {
            return r.move(-moveL[0],-moveL[1]);
        }
    }

    let moveR = util.rotateRight(move,2);
    if (0 <= r.me.y - moveR[1]  && r.me.y - moveR[1] < r.map.length && 0 < r.me.x - moveR[0] && r.me.x - moveR[0] < r.map.length)  {
        r.log("moveR: " + moveR);
        if (robotMap[r.me.y - moveR[1]][r.me.x - moveR[0]] === 0 && r.map[r.me.y - moveR[1]][r.me.x - moveR[0]]) {
            return r.move(-moveR[0],-moveR[1]);
        }
    }



}

export function defenseInit(r) {
    let robots = r.getVisibleRobots();
    for (let i = 0;i <  robots.length;i++) {
        if (robots[i].unit === SPECS.CASTLE) {
            r.dir = [r.me.x - robots[i].x,r.me.y - robots[i].y];
        }
    }
}

export function defenseInit2(r) {
    return r.move(r.dir[0],r.dir[1]);
}

export function defense_step(r) {
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

