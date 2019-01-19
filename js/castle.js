import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';
import * as combat from "./combat.js";

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
    r.log("built " + unit_type + " at: " + target_x + ", " + target_y + "  job: " + job);
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
    r.unitMap = combat.unitMap(r);
    // for (let i = 0;i < r.size;i++) {
    //     let str = "";
    //     for (let j = 0;j < r.size;j++) {
    //         if (r.unitMap[i][j])
    //             str += '1';
    //         else
    //             str += '0';
    //     }
    //     r.log(str);
    // }
    //r.log(r.unitMap);
    r.unitLocationQueue = combat.unitLocationsQueue(r,20);
    r.log(r.unitLocationQueue.length + " possible units");
    r.buildQueue = [];
    r.pilgrimQueue = [];
    r.preacherQueue = [];
    r.prophetQueue = [];
    r.crusaderQueue = [];

    r.castleTalk(1);
    let robots = r.getVisibleRobots();
    // r.multiplier = r.numOfCastle;
    // for (let i = 0;i < robots.length;i++) {
    //     if (robots[i].team === r.me.team && robots[i].castle_talk === 1) {
    //         r.multiplier--;
    //
    //     }
    //
    // }
    // r.log("karbon multi: " + r.multiplier);

    for(let i=0;i<3;i++) {
        r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 10, fuel: 50});
        r.pilgrimQueue.push({x: r.karboniteCoords[i].x, y: r.karboniteCoords[i].y, code: constants.PILGRIM_JOBS.MINE_KARBONITE});
    }
    for(let i=0;i<3;i++) {
        r.buildQueue.push({unit: SPECS.PILGRIM, karbonite: 10, fuel: 50});
        r.pilgrimQueue.push({x: r.fuelCoords[i].x, y: r.fuelCoords[i].y, code: constants.PILGRIM_JOBS.MINE_FUEL});
    }

    r.log("prophet job");
    for (let i=0;i<r.unitLocationQueue.length;i++) {
        r.buildQueue.push({unit: SPECS.PROPHET,karbonite:25, fuel: 200});
        r.prophetQueue.push({x:r.unitLocationQueue[i].x, y: r.unitLocationQueue[i].y, code: constants.PROPHET_JOBS.DEFEND_GOAL});
    }

}

function step(r) {
    let visible = r.getVisibleRobots();

    ///// GENERAL CASTLE CODE /////

    //assignment
    for(let i=0;i<visible.length;i++) {
        if(visible[i].castle_talk === constants.INIT_CASTLETALK) {
            r.createdRobots[visible[i].id] = r.currentAssignment;
        }
    }

    //build unit from queue
    if(r.buildQueue.length > 0) {
        if(r.karbonite >= r.buildQueue[0].karbonite  && r.fuel >= r.buildQueue[0].fuel + 200) {
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





export function castle_step(r) {
    if (r.step % 100 === 0) {
        r.log("STEP: " + r.step);
    }
    if (r.step === 0) {
        init(r);
    } else if (r.step > 0) {
        return step(r);
    }

}