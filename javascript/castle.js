import {BCAbstractRobot, SPECS} from 'battlecode';
import * as util from "./util.js";
export function castle_step(r) {
    let visibleRobotMap = r.getVisibleRobotMap();
    if (r.karbonite >= 20) {

        for (let i = 0; i < 8; i++) {
            let dir = util.directions(i);

            if (r.map[r.me.y + dir[1]][r.me.x + dir[0]] && visibleRobotMap[r.me.y + dir[1]][r.me.x + dir[0]] === 0) {
                r.log("create Crusader");
                return r.buildUnit(SPECS.CRUSADER, dir[0], dir[1]);
            }
        }
    }
    if (r.me.team === 0) {
        return r.proposeTrade(-1 * Math.round(50 * Math.random()), -1 * Math.round(50 * Math.random()));
    } else {
        return r.proposeTrade(Math.round(50 * Math.random()), Math.round(50 * Math.random()));

    }
}

export function preacherRushInit(r) {
    r.size = r.map.length;
    r.HSymm = util.isHorizontallySymm(r);

    r.ECastleCoord = util.getReflectedCoord([r.me.x,r.me.y],r);
    r.log("Enemy Castle: " + r.ECastleCoord);
}

export function preacherRush(r) {
    let visibleRobotMap = r.getVisibleRobotMap();
    if (r.karbonite >= 30) {

        for (let i = 0; i < 8; i++) {
            let dir = util.directions(i);

            if (r.map[r.me.y + dir[1]][r.me.x + dir[0]] && visibleRobotMap[r.me.y + dir[1]][r.me.x + dir[0]] === 0) {
                r.log("create preacher");
                return r.buildUnit(SPECS.PREACHER, dir[0], dir[1]);
            }
        }
    }
}

export function defenseInit(r) {
    r.preacherTotal = 0;
}
export function defense(r) {
    let robots = r.getVisibleRobots();
    let robotMap = r.getVisibleRobotMap();
    let EnemyCount = [];
    for (let i = 0;i < robots.length;i++) {
        if (robots[i].team !== r.me.team && r.isVisible(robots[i])) {
            EnemyCount.push(robots[i]);
        }
    }
    r.log("count " + EnemyCount.length);
    if (EnemyCount.length === 0) return;
    if (r.EnemyPossibleLocation === undefined) {

        r.EnemyPossibleLocation = util.BFSToLocationInRadius(r.map,[EnemyCount[0].x,EnemyCount[0].y],[r.me.x,r.me.y],4,util.getMoves(2),r);

    }
    if (r.preacherTotal === 0  || (r.preacherTotal === 1 && EnemyCount.length > 1)) {

        let dir = util.directionTo(r.me.x,r.me.y,r.EnemyPossibleLocation[0],r.EnemyPossibleLocation[1]);
        r.log(dir);
        let dirR = util.rotateRight(dir,2);
        r.log("dirR" + dirR);
        if (robotMap[r.me.y + dirR[1]][r.me.x + dirR[0]] === 0  && r.map[r.me.y + dirR[1]][r.me.x + dirR[0]]) {
            r.log("REACHED 1");
            r.preacherTotal++;
            return r.buildUnit(SPECS.PREACHER, dirR[0], dirR[1]);
        }
        let dirL = util.rotateLeft(dir,2);
        if (robotMap[r.me.y + dirL[1]][r.me.x + dirL[0]] === 0  && r.map[r.me.y + dirL[1]][r.me.x + dirL[0]]) {
            r.log("reached 2");
            r.preacherTotal++;
            return r.buildUnit(SPECS.PREACHER, dirL[0], dirL[1]);
        }
        if (robotMap[r.me.y + dir[1]][r.me.x + dir[0]] === 0  && r.map[r.me.y + dir[1]][r.me.x + dir[0]]) {
            r.log("reached 3");
            r.preacherTotal
            return r.buildUnit(SPECS.PREACHER, dir[0], dir[1]);
        }
    }
}

