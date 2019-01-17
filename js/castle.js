import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';
import * as combat from "./combat.js";

function attempt_build(r, unit) {
    let dir_coord = [{x:-1,y:-1}, {x:-1,y:0}, {x:-1,y:1}, {x:0,y:1}, {x:1,y:1}, {x:1,y:0}, {x:1,y:-1}, {x:0,y:-1}];
    let vis_map = r.getVisibleRobotMap();

    for(let i=0;i<dir_coord.length;i++) {
        let newX = r.me.x + dir_coord.x;
        let newY = r.me.y + dir_coord.y;

        if(r.map[newY][newX] && vis_map[newY][newX] > 0) {
            return r.build(dir_coord.x, dir_coord.y, unit);
        }
    }
}

function build_unit(r,unit_type,target_x,target_y,job) {
    r.currentAssignment = {x: target_x, y: target_y, code: job};
    r.signal(util.signalCoords(target_x, target_y, job));
    return attempt_build(r, unit_type);
}

function init(r) {
    r.size = r.map.length;
    r.numOfCastle = r.getVisibleRobots().length;
    r.HSymm = util.isHorizontallySymm(r);
    r.enemy_castle = util.getReflectedCoord(r.me, r);
    r.karboniteCoords = util.resourceCoords(r.map, r.karbonite_map, {x:r.me.x, y:r.me.y}, util.getMoves(2));
    r.fuelCoords = util.resourceCoords(r.map, r.fuel_map, {x:r.me.x, y:r.me.y}, util.getMoves(2));
    r.createdRobots = {};

    //queues
    /**Build queue: {unit: SPECS.UNIT_TYPE, karbonite: minimum karbonite required to build, fuel: minimum fuel required to build}

     Unit queue: {x, y, code} for a job**/

     r.buildQueue = [];
    r.pilgrimQueue = [];
    r.preacherQueue = [];
    r.prophetQueue = [];
    r.crusaderQueue = [];


}

function step(r) {
    let visible = r.getVisibleRobots();

    //assignment
    for(let i=0;i<visible.length;i++) {
        if(visible[i].castle_talk === constants.INIT_CASTLETALK) {
            r.createdRobots[visible[i].id] = r.currentAssignment;
        }
    }

    //build unit from queue

    if(r.buildQueue.length > 0) {
        if(r.karbonite >= r.buildQueue[0].karbonite && r.fuel >= r.buildQueue[1].fuel) {
            let robot_to_build = r.buildQueue.shift();

            switch(robot_to_build.unit) {
                case SPECS.PILGRIM:
                    if(r.pilgrimQueue.length > 0) {
                        let job = r.pilgrimQueue.shift();
                        return build_unit(r, SPECS.PILGRIM, job.x, job.y, job.code);
                    }
                    break;

                case SPECS.CRUSADER:
                    if(r.crusaderQueue.length > 0) {
                        let job = r.crusaderQueue.shift();
                        return build_unit(r, SPECS.CRUSADER, job.x, job.y, job.code);
                    }
                    break;

                case SPECS.PROPHET:
                    if(r.prophetQueue.length > 0) {
                        let job = r.crusaderQueue.shift();
                        return build_unit(r, SPECS.PROPHET, job.x, job.y, job.code);
                    }
                    break;

                case SPECS.PREACHER:
                    if(r.preacherQueue.length > 0) {
                        let job = r.preacherQueue.shift();
                        return build_unit(r, SPECS.PREACHER, job.x, job.y, job.code);
                    }
                    break;
            }
        }
    }

}

function turn1_to_50() {
    r.buildQueue.push({unit:SPECS.PROPHET,karbonite:25,fuel});
    r.prophetQueue.push({x:0,y:0,code:constants.PROPHET_JOB.DEFEND_GOAL});
}


export function castle_step(r) {
    if (r.step === 0) {
        init(r);
    } else if (r.step > 0) {
        turn1_to_50();
        return step(r);
    }

}