import * as util from "./util.js"
import {SPECS} from 'battlecode';

function jobsInit(r) {
    r.jobs = {};
    r.currentJob = [0,0,0];
}

function jobsStep(r) {
    let visible = r.getVisibleRobots();

    for(let i=0;i<visible.length;i++) {
        if(visible[i].castle_talk === 255) {
            r.log('Assigning job ' + r.currentJob + ' to id ' + visible[i].id);
            r.jobs[visible[i].id] = r.currentJob;
            r.log(r.jobs);
            break;
        }
    }
}

function createUnit(r, unit, job) {
    r.currentJob = job;
    return build(r, unit);
}

function build(r, unit) {
    let dir_coord = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
    let pass_map = r.map;
    let visible_map = r.getVisibleRobotMap();

    for(let i=0;i<dir_coord.length;i++) {
        let move = dir_coord[i];
        if(util.withInMap(r.me.x + move[0], r.me.y + move[1], r) && pass_map[r.me.y + move[1]][r.me.x + move[0]] === true && visible_map[r.me.y + move[1]][r.me.x + move[0]] === 0) {
            r.log("built a pilgrim");
            return r.buildUnit(unit, move[0], move[1]);
        }
    }
}

function castle_pilgrim_init(r) {
    r.HSymm = util.isHorizontallySymm(r);
    r.enemy_castle = util.getReflectedCoord([r.me.x, r.me.y], r);

    r.karboniteCoords = util.karboniteCoords(r.map, r.karbonite_map, [r.me.x, r.me.y], util.getMoves(2));
    r.enemyKarboniteCoords = util.karboniteCoords(r.map, r.karbonite_map, [r.enemy_castle[0], r.enemy_castle[1]], util.getMoves(2));

    r.fuelCoords = util.karboniteCoords(r.map, r.fuel_map, [r.me.x, r.me.y], util.getMoves(2));
    r.fuelIndex = 0;

    r.enemy_karb_index = 0;
    while((r.enemyKarboniteCoords[0][0] - r.enemy_castle.x) ** 2 + (r.enemyKarboniteCoords[0][1] - r.enemy_castle.y) ** 2 < 36)
        r.enemy_karb_index++;

    r.bully_preachers_built = 0;

    r.initial_pilgrim_complete = false;
    r.initial_pilgrim_count = 0;
    r.castleCount = r.getVisibleRobots().length;
    r.stepsSinceLastDefense = 0;

}

function castle_pilgrim_step(r) {
    let signaledThisTurn = false;

    let target = r.karboniteCoords[r.initial_pilgrim_count];

    if(target !== undefined) {
        if (!r.initial_pilgrim_complete) {
            if (r.getVisibleRobots().length - r.castleCount >= 4) {
                r.initial_pilgrim_complete = true;
            } else {
                r.signal(util.signalCoords(target[0], target[1], util.PILGRIM_JOBS.MINE_KARBONITE), 2);
                r.initial_pilgrim_count++;
                return createUnit(r, SPECS.PILGRIM, [target[0], target[1], util.PILGRIM_JOBS.MINE_KARBONITE]);
            }
        }

        let visible = r.getVisibleRobots();
        for (let i = 0; i < visible.length; i++) {
            let robot = visible[i];

            if (robot.unit === SPECS.PILGRIM && robot.signal === 1) {
                r.signal(util.signalCoords(target[0], target[1], util.PILGRIM_JOBS.MINE_KARBONITE), 2);
                r.jobs[robot.id] = [target[0], target[1], util.PILGRIM_JOBS.MINE_KARBONITE];
                r.signaledThisTurn = true;
                r.initial_pilgrim_count++;
            }
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

        let dir = util.directionTo(r.me.x,r.me.y,r.EnemyPossibleLocation[0],r.EnemyPossibleLocation[1], r);
        //r.log(dir);
        let fuzMove = util.fuzzy_move2(r,dir[0],dir[1],2);
        //r.log("fuz move: " + fuzMove);
        if (fuzMove !== undefined) {
            r.preacherTotal++;
            r.log('built a preacher');
            r.currentJob = [0, 0, util.PREACHER_JOBS.DEFENSE];
            return r.buildUnit(SPECS.PREACHER,fuzMove[0],fuzMove[1]);
        }
        //r.log("build location: " + (r.me.x + dir[0]) + " , " + (r.me.y + dir[1]));
        if (util.withInMap(r.me.x + dir[0],r.me.y + dir[1],r) && robotMap[r.me.y + dir[1]][r.me.x + dir[0]] === 0  && r.map[r.me.y + dir[1]][r.me.x + dir[0]]) {
            r.log("built a preacher");
            r.preacherTotal++;
            r.currentJob = [0, 0, util.PREACHER_JOBS.DEFENSE];
            return r.buildUnit(SPECS.PREACHER, dir[0], dir[1]);
        }
    }
}

function castlePostRushInit(r) {
    r.currentBuild = SPECS.PROPHET;
    r.preacherTotal = 0;
    r.prophetTotal = 0;
    r.enemyKarboniteIndex = 0;
    r.postRushTotal = 0;
    r.count = 0;
}
function castlePostRushStep(r) {
    let robotMap = r.getVisibleRobotMap();
    if(r.count >= 2)
        return;
    if(r.postRushTotal % 5 === 0 && r.karbonite >= 20 && r.fuel >= 50 && r.fuelIndex < r.fuelCoords.length) {
        r.postRushTotal++;
        r.log("Building Fuel Pilgrim");
        let target = r.fuelCoords[r.fuelIndex];
        r.fuelIndex++;
        r.signal(util.signalCoords(target[0], target[1], util.PILGRIM_JOBS.MINE_FUEL), 2);
        return createUnit(r, SPECS.PILGRIM, [target[0], target[1], util.PILGRIM_JOBS.MINE_FUEL]);
    }

    if (r.currentBuild == SPECS.PREACHER && r.karbonite >= 30 && r.fuel >= 50) {
        r.count++;
        r.postRushTotal++;

        r.currentBuild = SPECS.PROPHET;
        let target = r.enemyKarboniteCoords[r.enemyKarboniteIndex % r.enemyKarboniteCoords.length];
        r.enemyKarboniteIndex++;
        r.log("Builted Pillage Preacher");
        r.signal(util.signalCoords(target[0], target[1], util.PREACHER_JOBS.PILLAGE_KARBONITE),2);
        return createUnit(r, SPECS.PREACHER, [target[0], target[1], util.PREACHER_JOBS.PILLAGE_KARBONITE]);

    }
    if (r.currentBuild == SPECS.PROPHET && r.karbonite >= 25 && r.fuel >= 50) {
        r.count++;
        r.postRushTotal++;

        r.currentBuild = SPECS.PREACHER;
        let target = r.enemyKarboniteCoords[r.enemyKarboniteIndex % r.enemyKarboniteCoords.length];

        r.log("Builted Pillage Prophet");
        r.signal(util.signalCoords(target[0], target[1], util.PREACHER_JOBS.PILLAGE_KARBONITE),2);
        return createUnit(r, SPECS.PROPHET, [target[0], target[1], util.PROPHET_JOBS.PILLAGE_KARBONITE]);
    }
}
export function castle_step(r) {
    if(r.step === 0) {
        jobsInit(r);
        defenseInit(r);
        castle_pilgrim_init(r);
    }
    jobsStep(r);

    if (r.step === 50) {
        castlePostRushInit(r);

    } else if (r.step > 50) {
        return castlePostRushStep(r);
    } else {
        let defenseOutput = defense(r);
        if(defenseOutput !== undefined) {
            r.stepsSinceLastDefense = 0;
            return defenseOutput;
        }
        else if(r.step > 0) {
            r.stepsSinceLastDefense++;
            return castle_pilgrim_step(r);
        }
    }
}