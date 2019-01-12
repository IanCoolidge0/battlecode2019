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

function castle_pilgrim_init(r) {
    r.karboniteCoords = util.karboniteCoords(r.map, r.karbonite_map, [r.me.x, r.me.y], util.getMoves(2));
    r.initial_pilgrim_complete = false;
    r.initial_pilgrim_count = 0;
    r.castleCount = r.getVisibleRobots().length;
}

function castle_pilgrim_step(r) {
    let target = r.karboniteCoords[r.initial_pilgrim_count];
    if(!r.initial_pilgrim_complete) {
        if(r.getVisibleRobots().length - r.castleCount === 4 || (target[0] - r.me.x) ** 2 + (target[1] - r.me.y) ** 2 > 64) {
            r.initial_pilgrim_complete = true;
        } else {
            r.signal(util.signalCoords(target[0], target[1]), 2);
            r.initial_pilgrim_count++;
            return build(r, SPECS.PILGRIM);
        }
    }

    let visible = r.getVisibleRobots();
    for(let i=0;i<visible.length;i++) {
        let robot = visible[i];

        if(robot.unit === SPECS.PILGRIM && robot.signal === 1) {
            r.signal(util.signalCoords(target[0], target[1]), 2);
            r.initial_pilgrim_count++;
        }
    }
}

function defenseInit(r) {
    r.preacherTotal = 0;
}

function defense(r) {
    let robots = r.getVisibleRobots();
    let robotMap = r.getVisibleRobotMap();
    let EnemyCount = [];
    for (let i = 0;i < robots.length;i++) {
        if (robots[i].team !== r.me.team && r.isVisible(robots[i])) {
            EnemyCount.push(robots[i]);
        }
    }
    //r.log("count " + EnemyCount.length);
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
            r.log("built a preacher");
            r.preacherTotal++;
            return r.buildUnit(SPECS.PREACHER, dirR[0], dirR[1]);
        }
        let dirL = util.rotateLeft(dir,2);
        if (robotMap[r.me.y + dirL[1]][r.me.x + dirL[0]] === 0  && r.map[r.me.y + dirL[1]][r.me.x + dirL[0]]) {
            r.log("built a preacher");
            r.preacherTotal++;
            return r.buildUnit(SPECS.PREACHER, dirL[0], dirL[1]);
        }
        if (robotMap[r.me.y + dir[1]][r.me.x + dir[0]] === 0  && r.map[r.me.y + dir[1]][r.me.x + dir[0]]) {
            r.log("built a preacher");
            r.preacherTotal++;
            return r.buildUnit(SPECS.PREACHER, dir[0], dir[1]);
        }
    }
}

export function castle_step(r) {
    if(r.step === 0) {
        defenseInit(r);
        castle_pilgrim_init(r);
    } else {
        let defenseOutput = defense(r);
        if(defenseOutput !== undefined)
            return defenseOutput;
        else
            return castle_pilgrim_step(r);
    }
}