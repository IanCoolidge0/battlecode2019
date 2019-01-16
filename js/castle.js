import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';

function attempt_build(r, unit) {
    let dir_coord = [{x:-1,y:-1}, {x:-1,y:0}, {x:-1,y:1}, {x:0,y:1}, {x:1,y:1}, {x:1,y:0}, {x:1,y:-1}, {x:0,y:-1}];
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
    r.currentAssignment = {x: target_x, y: target_y, code: job};
    r.signal(util.signalCoords(target_x, target_y, job), 2);
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
    r.buildQueue = [];
    r.pilgrimQueue = [];
    r.preacherQueue = [];
    r.prophetQueue = [];
    r.crusaderQueue = [];

    for(let i=0;i<3;i++) {
        r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 10, fuel: 10});
        r.pilgrimQueue.push({x: r.karboniteCoords[i].x, y: r.karboniteCoords[i].y, code: constants.PILGRIM_JOBS.MINE_KARBONITE});
    }
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
        if(r.karbonite >= r.buildQueue[0].karbonite && r.fuel >= r.buildQueue[0].fuel) {
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

export function castle_step(r) {

    if (r.step === 0) {
        init(r);
    } else if (r.step > 0) {
        return step(r);
    }

}