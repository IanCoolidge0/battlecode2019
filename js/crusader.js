import * as util from "./util.js"
import {SPECS} from 'battlecode';

function init(r) {
    r.castletalk(util.INIT_CASTLETALK);


}
export function crusader_step(r) {
    if (step === 0) {
        init(r);
    }

}