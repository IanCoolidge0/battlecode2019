import {BCAbstractRobot, SPECS} from 'battlecode';
import {crusader_step,crusaderInit} from "./crusader.js";
import {pilgrim_step} from "./pilgrim.js";
import * as castle from "./castle.js";
import * as preacher from "./preacher.js";
import {church_step} from "./church.js";
import {prophet_step} from "./prophet.js";
import * as util from "./util.js";



class MyRobot extends BCAbstractRobot {
    constructor() {
        super();
        this.step = -1;
    }

    turn() {
        
        this.step++;

        //this.log(this.step);



        if (this.step == 0) {

            if (this.me.unit === SPECS.CASTLE) {
                castle.defenseInit(this);


            }
            if (this.me.unit === SPECS.PREACHER) {
                preacher.defenseInit(this);

            }

        }
        if (this.me.unit === SPECS.CASTLE) {
            return castle.defense(this);
        }




        if (this.step === 1) {
            if (this.me.unit === SPECS.PREACHER) {
                return preacher.defenseInit2(this);
            }
        }
        if (this.me.unit === SPECS.PREACHER) {
            return preacher.defense_step(this);
        }
            // if (this.step == 0) {
            //
            //     if (this.me.unit === SPECS.CASTLE) {
            //         if (this.me.team === 0) {
            //             castle.defenseInit(this);
            //         }
            //         else if (util.numOfCastle(this) === 1) {
            //             this.strat = "PREACHER RUSH";
            //             castle.preacherRushInit(this);
            //
            //         }
            //     }
            //     if (this.me.unit === SPECS.PREACHER) {
            //         if (this.me.team === 0 ) {
            //             preacher.defenseInit(this);
            //         } else preacher.init(this);
            //     }
            //
            // }
            // if (this.me.unit === SPECS.CASTLE) {
            //     if (this.me.team === 0) {
            //         return castle.defense(this);
            //     }
            //
            //
            //     if (this.strat === "PREACHER RUSH") {
            //         this.signal(util.signalCoords(this.ECastleCoord[0], this.ECastleCoord[1]), 2);
            //         return castle.preacherRush(this);
            //     }
            // }
            // if (this.step === 1) {
            //     if (this.me.unit === SPECS.PREACHER && this.me.team === 0) {
            //         return preacher.defenseInit2(this);
            //     }
            // }
            // if (this.me.unit === SPECS.PREACHER) {
            //     if (this.me.team === 0 ) {
            //         return preacher.defense_step(this);
            //     }
            //     return preacher.step(this);
            //
            // }


        // if (this.step === 1 && this.me.unit === SPECS.CRUSADER){
        //     crusaderInit(this);
        // }
        // if (this.step === 1 && this.me.unit === SPECS.CASTLE){
        //     this.HSymm = util.isHorizontallySymm(this)
        //     this.numOfCastle = util.numOfCastle(this);
        //     this.log(this.HSymm + " num:" + this.numOfCastle);
        //     // this.log(util.isHorizontallySymm(this));
        //
        //     // util.create2dArray(2,2,0);
        //     // let moves = util.getMoves(3);
        //     // this.log(util.pathfindingMap(this.map,[this.me.x,this.me.y],moves));
        //
        // }
        //
        // if (this.me.unit === SPECS.CRUSADER) {
        //
        //     crusader_step(this);
        // } else if(this.me.unit === SPECS.PILGRIM) {
        //     pilgrim_step(this);
        // } else if(this.me.unit === SPECS.CASTLE) {
        //
        //     return castle_step(this);
        // } else if(this.me.unit === SPECS.PREACHER) {
        //     preacher_step(this);
        // } else if(this.me.unit === SPECS.CHURCH) {
        //      church_step(this);
        // } else if(this.me.unit === SPECS.PROPHET) {
        //     prophet_step(this);
        // }
        
    }
}

var robot = new MyRobot();