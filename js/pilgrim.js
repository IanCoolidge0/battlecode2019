import * as util from "./util.js"
import {SPECS} from 'battlecode';

function init(r) {
    r.castletalk(util.INIT_CASTLETALK);


}
export function pilgrim_step(r) {
    if (step === 0) {
        init(r);
    }

}