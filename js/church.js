import * as util from "./util.js"
import {SPECS} from 'battlecode';
import * as constants from "./constants.js";

import * as combat from "./combat.js";


function attempt_build(r, unit,dir) {
    let dir_coord = [dir, util.rotateLeft(dir,1), util.rotateRight(dir,1), util.rotateLeft(dir,2),
        util.rotateRight(dir,2), util.rotateLeft(dir,3), util.rotateRight(dir,3), util.rotateLeft(dir,4)];
    let vis_map = r.getVisibleRobotMap();

    for(let i=0;i<dir_coord.length;i++) {
        let newX = r.me.x + dir_coord[i].x;
        let newY = r.me.y + dir_coord[i].y;

        if(r.map[newY][newX] && vis_map[newY][newX] === 0) {

            return r.buildUnit(unit, dir_coord[i].x, dir_coord[i].y);
        }
    }
}

function build_unit(r,unit_type,target_x,target_y,job) {
    r.currentAssignment = {unit: unit_type, x: target_x, y: target_y, code: job};
    r.signal(util.signalCoords(target_x, target_y, job), 2);
    r.log("built " + unit_type + " at: " + target_x + ", " + target_y + "  job: " + job);
    return attempt_build(r, unit_type,util.directionTo(target_x,target_y));
}

function init(r) {
    r.size = r.map.length;
    r.buildQueue = [];
    
    r.pilgrimQueue = [];
    r.preacherQueue = [];
    r.prophetQueue = [];
    r.crusaderQueue = [];
    let dir_coord = [{x:-1,y:-1}, {x:-1,y:0}, {x:-1,y:1}, {x:0,y:1}, {x:1,y:1}, {x:1,y:0}, {x:1,y:-1}, {x:0,y:-1}];
    r.unitMap = combat.unitMap(r);
    //r.log("UNITMAP_________________________________________")
    //r.log(r.unitMap);
    r.unitLocationQueue = combat.unitLocationsQueue(r,2,2,r.unitMap,true);

    for (let i=0;i<r.unitLocationQueue.length;i++) {
        r.buildQueue.push({unit: SPECS.PROPHET,karbonite:25, fuel: 200});
        r.prophetQueue.push({x:r.unitLocationQueue[i].x, y: r.unitLocationQueue[i].y, code: constants.PROPHET_JOBS.DEFEND_GOAL});
    }
}

function step(r) {
    //build unit from queue
    if(r.buildQueue.length > 0) {
        let requiredKarbonite = r.buildQueue[0].karbonite;
        let requiredFuel = r.buildQueue[0].fuel;

        if((r.karbonite >= requiredKarbonite + 70 && r.fuel >= requiredFuel) || (r.buildQueue[0].priority && r.karbonite >=r.buildQueue[0].karbonite && r.fuel >= r.buildQueue[0].fuel)) {
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
                        let job = r.prophetQueue.shift();
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

export function church_step(r) {
    if (r.step === 0) {
        init(r);
    } else {
        return step(r);
    }
}

