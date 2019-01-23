import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';
import * as combat from "./combat.js";
import * as mode from "./mode.js";




function init(r) {
    r.size = r.map.length;

    r.castleTalk(constants.INIT_CASTLETALK);

    r.parent_castle = util.findParentCastle(r);
    r.parent_castle_coords = {x:r.parent_castle.x,y:r.parent_castle.y};
    r.currentJob = util.decodeCoords(r.parent_castle.signal);
    r.log(r.currentJob);
    if(r.currentJob.code === constants.PREACHER_JOBS.DEFEND_CASTLE) {

        r.mode = constants.PREACHER_MODE.DEFEND_CASTLE;


        // r.log('goal');
        // r.log(r.goal_map[r.me.y][r.me.x]);
        let move = util.directionTo(r.currentJob.x - r.me.x,r.currentJob.y - r.me.y);
        //r.log('enemy dir');
        //r.log(move);
        if(Math.random() > 0.5) {
            move = util.rotateRight(move, 1);
        } else {
            move = util.rotateLeft(move, 1);
        }

        //r.log(move);
        return util.fuzzyMove(r,move.x,move.y,2,0);
    }
    if (r.currentJob.code === constants.PREACHER_JOBS.DEFEND_GOAL) {
        r.mode = constants.PREACHER_MODE.PATH_TO_GOAL;
        r.moves = util.getMoves2(2);
        r.goal_map = util.BFSMap_with_rmap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, r.moves, r);
    }

}
function step(r) {
    if (r.mode === constants.PREACHER_MODE.DEFEND_CASTLE) {
        //r.log('attacking');
        let attack = combat.preacher_best_attack(r);
        //r.log('attack');
        //r.log(attack);
        if (attack !== undefined) {
            return r.attack(attack.x,attack.y);
        }
    }

    let distance_to_goal = (r.me.x - r.currentJob.x) ** 2 + (r.me.y - r.currentJob.y) ** 2;
    let rmap = r.getVisibleRobotMap();
    if (r.fuel < 300) return;
    if (r.mode !== constants.PREACHER_MODE.ATTACK && combat.enemyInRange(r)) {
        //r.log("CHANGE MODE TO ATTACK");
        r.mode = constants.PREACHER_MODE.ATTACK;
    } else if (r.mode !== constants.PREACHER_MODE.DEFEND &&
        r.currentJob.x === r.me.x && r.currentJob.y === r.me.y) {
        //r.log("CHANGE MODE TO DEFEND");
        r.mode = constants.PREACHER_MODE.DEFEND;
    } else if (r.mode !== constants.PREACHER_MODE.PATH_TO_GOAL && distance_to_goal > 2) {
        //r.log("CHANGE MODE TO PATH TO GOAL");
        r.mode = constants.PREACHER_MODE.PATH_TO_GOAL;
    }




    if (r.mode === constants.PROPHET_MODE.PATH_TO_GOAL) {
        return mode.travel_to_goal5(r,r.moves);
    }
    if (r.mode === constants.PROPHET_MODE.DEFEND) {
        return;
    }
    if (r.mode === constants.PROPHET_MODE.ATTACK) {
        //r.log("parent");
        //r.log(r.parent_castle_coords);
        return mode.prophet_attack(r,r.parent_castle_coords);
    }

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