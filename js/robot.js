import {BCAbstractRobot, SPECS} from 'battlecode';
import {crusader_step} from "./crusader.js";
import {pilgrim_step} from "./pilgrim.js";
import {castle_step} from "./castle.js";
import {preacher_step} from "./preacher.js";
import {church_step} from "./church.js";
import {prophet_step} from "./prophet.js";
import * as nav from "./nav.js";
import * as util from "./util.js";

class MyRobot extends BCAbstractRobot {

    constructor() {
        super();
        this.step = -1;
    }

    turn() {
        this.step++;

        if (this.me.unit === SPECS.CRUSADER) {
            return crusader_step(this);
        } else if(this.me.unit === SPECS.PILGRIM) {
            return pilgrim_step(this);
        } else if(this.me.unit === SPECS.CASTLE) {
            return castle_step(this);
        } else if(this.me.unit === SPECS.PREACHER) {
            return preacher_step(this);
        } else if(this.me.unit === SPECS.CHURCH) {
            return church_step(this);
        } else if(this.me.unit === SPECS.PROPHET) {
            return prophet_step(this);
        }
        
    }
}

var robot = new MyRobot();