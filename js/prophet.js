import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';

function init(r) {
    r.castleTalk(constants.INIT_CASTLETALK);

}

export function step(r) {

}

export function prophet_step(r) {
    if (step === 0) {
        init(r);
    }

}