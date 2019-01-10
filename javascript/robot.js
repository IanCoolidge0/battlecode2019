import {BCAbstractRobot, SPECS} from 'battlecode';
import {crusader_step} from "./crusader.js";
import {pilgrim_step} from "./pilgrim.js";
import {castle_step} from "./castle.js";
import {preacher_step} from "./preacher.js";
import {church_step} from "./church.js";
import {prophet_step} from "./prophet.js";
import * as util from "./util.js";

var step = -1;

class MyRobot extends BCAbstractRobot {
    turn() {
        step++;
        this.log(step);
        if (step === 1) {
            util.create2dArray(2,2,0);
            let moves = util.getMoves(3);
            this.log(util.pathfindingMap(this.map,[this.me.x,this.me.y],moves));

        }
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