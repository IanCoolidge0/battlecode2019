import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';
import * as combat from "./combat.js";



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
        r.log('enemy dir');
        r.log(move);
        if(Math.random() > 0.5) {
            move = util.rotateRight(move, 1);
        } else {
            move = util.rotateLeft(move, 1);
        }

        //r.log(move);
        return util.fuzzyMove(r,move.x,move.y,2,0);
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
}

export function preacher_step(r) {

    if (r.step === 0) {
        return init(r);
    } else {
        r.castleTalk(124);
    }
    return step(r);


}