import {BCAbstractRobot, SPECS} from 'battlecode';
import {crusader_step} from "./crusader";
import {pilgrim_step} from "./pilgrim";
import {castle_step} from "./castle";
import {preacher_step} from "./preacher";
import {church_step} from "./church";
import {prophet_step} from "./prophet";
import * as util from "./util"

var step = -1;

class MyRobot extends BCAbstractRobot {
    turn() {
        step++;

        if (this.me.unit === SPECS.CRUSADER) {
            crusader_step(this);
        } else if(this.me.unit === SPECS.PILGRIM) {
            pilgrim_step(this);
        } else if(this.me.unit === SPECS.CASTLE) {
            castle_step(this);
        } else if(this.me.unit === SPECS.PREACHER) {
            preacher_step(this);
        } else if(this.me.unit === SPECS.CHURCH) {
            church_step(this);
        } else if(this.me.unit === SPECS.PROPHET) {
            prophet_step(this);
        }
        
    }
}

var robot = new MyRobot();