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

        // r.goal_map = util.BFSMap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));
        // let move = r.goal[r.me.y][r.me.x];
        //
        // //r.log(move);
        // return util.fuzzyMove(r,move.x,move.y,2,1);
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
        init(r);
    } else {
        r.castleTalk(124);
    }
    return step(r);


}