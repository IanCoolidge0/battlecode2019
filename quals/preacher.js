import * as util from "./util.js";
import {SPECS} from 'battlecode';
import * as combat from "./combat.js";
import * as mode from "./mode.js";
import * as constants from "./constants.js";




function init(r) {
    r.size = r.map.length;
    r.wait = 0;
    r.castleTalk(constants.INIT_CASTLETALK);
    r.unitlessMap = combat.unitlessMap(r);

    r.parent_castle = util.findParentCastle(r);
    r.parent_castle_coords = {x:r.parent_castle.x,y:r.parent_castle.y};
    r.currentJob = util.decodeCoords(r.parent_castle.signal);
    r.log(r.currentJob);
    if(r.currentJob.code < 8) {

        r.mode = constants.PREACHER_MODE.DEFEND_CASTLE;

        r.wait = 0;
        // r.log('goal');
        // r.log(r.goal_map[r.me.y][r.me.x]);
        r.moves = util.getMoves(2);
        r.goal_map = util.BFSMap_with_rmap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, r.moves, r);
        return mode.travel_to_goal5(r,r.moves);
    }


    if (r.currentJob.code === constants.PREACHER_JOBS.DEFEND_GOAL) {
        r.mode = constants.PREACHER_MODE.PATH_TO_GOAL;
        r.moves = util.getMoves(2);
        r.goal_map = util.BFSMap_with_rmap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, r.moves, r);
    }
    if (r.currentJob.code === constants.PREACHER_JOBS.ATTACK_GOAL_LOWER) {
        r.mode = constants.PROPHET_MODE.PATH_TO_GOAL;
        r.moves = util.getMoves(2);
        r.safetyMap = util.safetyMapUnderLine2(r,{x:r.currentJob.x,y:r.currentJob.y},{x:r.me.x,y:r.me.y},true)
        r.allyIsLower = true;
        r.goal_map = util.BFSMap_with_rmap(r.safetyMap, {x: r.currentJob.x, y: r.currentJob.y}, r.moves, r);
    }
    if (r.currentJob.code === constants.PREACHER_JOBS.ATTACK_GOAL_HIGHER) {
        r.mode = constants.PROPHET_MODE.PATH_TO_GOAL;
        r.moves = util.getMoves(2);
        r.allyIsLower = false;
        r.safetyMap = util.safetyMapUnderLine2(r,{x:r.currentJob.x,y:r.currentJob.y},{x:r.me.x,y:r.me.y},false)

        r.goal_map = util.BFSMap_with_rmap(r.safetyMap, {x: r.currentJob.x, y: r.currentJob.y}, r.moves, r);
    }
    if(r.currentJob.code === constants.PREACHER_JOBS.SUICIDE) {
        r.mode = constants.PREACHER_MODE.PATH_TO_GOAL;
        r.moves = util.getMoves(2);

        r.goal_map = util.BFSMap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, r.moves);
    }
    if (r.currentJob.code === constants.PREACHER_JOBS.DEFEND_ENEMY_CHURCH) {
        r.mode = constants.PREACHER_MODE.PATH_TO_CHURCH;
        r.safety_map = util.safetyMap(r, [util.getReflectedCoord(r.parent_castle_coords, r)]);

        r.goal_map = util.BFSMap_near_church(r.safety_map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2),r);
    }

}
function step(r) {

    if(r.mode === constants.PREACHER_MODE.VICTORY) return;

    if(r.currentJob.code === constants.PREACHER_JOBS.SUICIDE) {
        let visible = r.getVisibleRobots();
        for(let i=0;i<visible.length;i++) {
            let signal = util.decodeCoords(visible[i].signal);
            if(signal.code === constants.SIGNAL_CODE.PREACHER_VICTORY && signal.x === r.currentJob.x && signal.y === r.currentJob.y) {
                r.log('rec victory signal');
                r.mode = constants.PREACHER_MODE.VICTORY;
            }
        }

        let robotAtGoal = r.getVisibleRobotMap()[r.currentJob.y][r.currentJob.x];
        if(robotAtGoal !== -1) {
            if(robotAtGoal === 0 || r.getRobot(robotAtGoal).unit !== SPECS.CASTLE) {
                r.log("VICTORY ROYALE!!!!!!!!!!!!!!! " + r.currentJob.x + " " + r.currentJob.y);
                r.signal(util.signalCoords(r.currentJob.x, r.currentJob.y, constants.SIGNAL_CODE.PREACHER_VICTORY), 2 * r.map.length ** 2);
                r.mode = constants.PREACHER_MODE.VICTORY;
            }
        }

    }

    if (r.mode === constants.PREACHER_MODE.DEFEND_CASTLE) {
        if (r.wait === 5) {
            r.mode = constants.PREACHER_MODE.PATH_TO_GOAL;
            r.goal_map = util.BFSMap_with_rmap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, r.moves, r);
        }
        r.wait++;
        let attack = combat.preacher_best_attack(r);
        if (attack !== undefined) {
            r.wait = 0;
            return r.attack(attack.x,attack.y);
        } else {
            return;
        }

    }
    if (r.fuel < 300) {
        r.log("no fuel");
        return;
    }
    if (r.mode === constants.PREACHER_MODE.MOVE_TO_FRONT_LINES) {
        if (r.currentJob.code === constants.PREACHER_JOBS.DEFEND_GOAL) {
            if (r.wait === 10) {
                r.mode = constants.PREACHER_MODE.PATH_TO_GOAL;
                r.goal_map = util.BFSMap_with_rmap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, r.moves, r);
            }
            r.wait++;
            let attack = combat.preacher_best_attack_with_signaling(r);
            if (attack !== undefined) {
                r.wait = 0;
                return r.attack(attack.x,attack.y);
            }
            let distance_to_castle = Math.max(Math.abs(r.me.x - r.parent_castle_coords.x),Math.abs(r.me.y - r.parent_castle_coords.y));
            if (distance_to_castle < 6) {
                r.log("ATTEMPTING TO MOVE TO FRONT LINES");
                return mode.moveToFrontLines(r,r.unitlessMap);
            }
            return;
        }
        if (r.currentJob.code === constants.PREACHER_JOBS.ATTACK_GOAL_HIGHER || r.currentJob.code === constants.PREACHER_JOBS.ATTACK_GOAL_LOWER) {
            if (r.wait === 10) {
                r.mode = constants.PREACHER_MODE.PATH_TO_GOAL;
                r.goal_map = util.BFSMap_with_rmap(r.safetyMap, {x: r.currentJob.x, y: r.currentJob.y}, r.moves, r);
            }
            r.wait++;
            let attack = combat.preacher_best_attack_with_signaling(r);
            if (attack !== undefined) {
                r.wait = 0;
                return r.attack(attack.x,attack.y);
            }
        }

    }
    let distance_to_goal = (r.me.x - r.currentJob.x) ** 2 + (r.me.y - r.currentJob.y) ** 2;
    let distance_castle = (r.me.x - r.parent_castle_coords.x) ** 2 + (r.me.y - r.parent_castle_coords.y) ** 2;
    let rmap = r.getVisibleRobotMap();
    let frontLine = neededInFrontLines(r);
    if (r.fuel < 300) return;
    if (combat.enemyInRange(r)) {
        //r.log("CHANGE MODE TO ATTACK");
        r.mode = constants.PREACHER_MODE.ATTACK;
    } else if (frontLine !== false && r.currentJob.code !== constants.PREACHER_JOBS.SUICIDE) {
        r.mode = constants.PREACHER_MODE.MOVE_TO_FRONT_LINES;
        r.wait = 0;
        if (r.currentJob.code === constants.PREACHER_JOBS.DEFEND_GOAL) {

            r.unitlessMap = combat.unitlessMap(r);
            r.unitlessMap[r.me.y][r.me.x] = true;
            r.unitlessMap[frontLine.y][frontLine.x] = true;

            r.frontLineMap = util.BFSMap(r.unitlessMap,frontLine,util.getMoves(2));

            r.log('frontLineMap created');
            r.log(r.frontLineMap[r.me.y][r.me.x]);
        }
        if (r.currentJob.code === constants.PREACHER_JOBS.ATTACK_GOAL_HIGHER || r.currentJob.code === constants.PREACHER_JOBS.ATTACK_GOAL_LOWER) {
            if (r.allyIsLower) {
                if (util.isHorizontallySymm(r)) {

                    return util.fuzzyMove(r,0,2,2,1);
                } else {
                    return util.fuzzyMove(r,2,0,2,1);
                }
            } else {
                if (util.isHorizontallySymm(r)) {
                    return util.fuzzyMove(r,0,-2,2,1);
                } else {
                    return util.fuzzyMove(r,-2,0,2,1);
                }
            }
        }

    } else if (r.mode !== constants.PREACHER_MODE.DEFEND &&
        r.currentJob.x === r.me.x && r.currentJob.y === r.me.y) {
        //r.log("CHANGE MODE TO DEFEND");
        r.mode = constants.PREACHER_MODE.DEFEND;
    } else if (r.mode !== constants.PREACHER_MODE.PATH_TO_GOAL && distance_to_goal > 2) {
        //r.log("CHANGE MODE TO PATH TO GOAL");
        r.mode = constants.PREACHER_MODE.PATH_TO_GOAL;
    }




    if (r.mode === constants.PREACHER_MODE.PATH_TO_GOAL) {

        if (r.currentJob.code === constants.PREACHER_JOBS.ATTACK_GOAL_HIGHER || r.currentJob.code === constants.PREACHER_JOBS.ATTACK_GOAL_LOWER) {
            return mode.travel_to_attack_goal(r,r.moves);
        }
        //r.log('attempt travel to goal' + r.currentJob.x + ', ' + r.currentJob.y);
        return mode.travel_to_goal5(r,r.moves);
    }
    if (r.mode === constants.PREACHER_MODE.DEFEND) {
        return;
    }
    if (r.mode === constants.PREACHER_MODE.ATTACK) {
        //r.log("parent");
        //r.log(r.parent_castle_coords);
        let attack = combat.preacher_best_attack_with_signaling(r);
        if (attack !== undefined) {
            return r.attack(attack.x, attack.y);
        }
    }
}
function neededInFrontLines(r) {
    if(r.currentJob.code === constants.PREACHER_JOBS.SUICIDE) return;
    let robots = r.getVisibleRobots();
    let enemy_signaled = [];
    for (let i = 0;i < robots.length;i++) {
        let robot = robots[i];

        if (r.isRadioing(robot) && robot.signal_radius === 65) {
            let signal = util.decodeCoords(robot.signal);
            if (signal.code === SPECS.CRUSADER || signal.code === SPECS.PREACHER) {
                r.log("FOUND SIGNAL:");
                r.log(signal);
                let enemyLocation = {x:signal.x,y:signal.y};
                let enemyMoves = signal.unit === SPECS.CRUSADER ? util.getMoves(3):util.getMoves(2);
                let enemyRange = SPECS.UNITS[signal.code].ATTACK_RADIUS[1];
                let enemyAttackLocation = util.location_within_attackRange(r.map,enemyLocation,{x:r.parent_castle_coords.x,y:r.parent_castle_coords.y},enemyMoves,enemyRange);
                let enemyDirection = util.directionTo(enemyAttackLocation.x - r.parent_castle_coords.x,enemyAttackLocation.y - r.parent_castle_coords.y);

                let myDirection = util.directionTo(r.me.x - r.parent_castle_coords.x,r.me.y - r.parent_castle_coords.y);
                if (util.similar_with_tolerance(enemyDirection,myDirection,1)) {
                    return {x:signal.x,y:signal.y};
                }
            }

        }
    }
    return false;
}



function step_over_50(r) {

    let rmap = r.getVisibleRobotMap();
    if (r.fuel < 300) return;
    if (combat.enemyInRange(r)) {
        let attack = combat.preacher_best_attack(r);
        //r.log('attack');
        //r.log(attack);
        if (attack !== undefined) {
            return r.attack(attack.x,attack.y);
        }
    }
    let dir = r.goal_map[r.me.y][r.me.x];



    return util.fuzzyMove(r,-dir.x,-dir.y,2,2);
}

export function preacher_step(r) {


    if (r.step === 0) {
        return init(r);
    } else {
        r.castleTalk(124);
    }


    return step(r);



}