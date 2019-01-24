import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';
import * as combat from "./combat.js";
import * as mode from "./mode.js";

function init(r) {
    r.size = r.map.length;

    r.castleTalk(constants.INIT_CASTLETALK);

    r.parent_castle = util.findParentCastle(r);
    r.parent_castle_coords = {x:r.parent_castle.x,y:r.parent_castle.y};
    r.currentJob = util.decodeCoords(r.parent_castle.signal);
    //r.log(r.currentJob);

    if(r.currentJob.code === constants.CRUSADER_JOBS.DEFEND_GOAL) {
        r.mode = constants.CRUSADER_JOBS.PATH_TO_GOAL;
        r.goal_map = util.BFSMap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));
    } else if(r.currentJob.code === constants.CRUSADER_JOBS.DEFEND_ENEMY_CHURCH) {
        r.mode = constants.CRUSADER_MODE.PATH_TO_CHURCH;
        r.safety_map = util.safetyMap(r, [util.getReflectedCoord(r.parent_castle_coords, r)]);

        r.goal_map = util.BFSMap(r.safety_map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));
    }

}

export function step(r) {

    let rmap = r.getVisibleRobotMap();


    if(r.currentJob.code === constants.CRUSADER_JOBS.DEFEND_ENEMY_CHURCH && r.mode === constants.CRUSADER_MODE.PATH_TO_CHURCH && (r.currentJob.x === r.me.x && r.currentJob.y === r.me.y)) {
        r.currentJob.x = r.me.x;
        r.currentJob.y = r.me.y;
        r.mode = constants.CRUSADER_MODE.DEFEND;
        let moves = util.getMoves(2);

        for (let i = 0;i < moves.length;i++) {
            let next = {x:r.me.x +moves[i].x,y:r.me.y + moves[i].y};
            if (util.withInMap(next,r) && rmap[next.y][next.x] === 0 && r.map[next.y][next.x] &&
                !r.karbonite_map[next.y][next.x] && !r.fuel_map[next.y][next.x]) {
                return r.move(moves[i].x,moves[i].y);
            }
        }
        moves = util.getMoves(3);
        for (let i = 0;i < moves.length;i++) {
            let next = {x:r.me.x +moves[i].x,y:r.me.y + moves[i].y};
            if (util.withInMap(next,r) && rmap[next.y][next.x] === 0 && r.map[next.y][next.x] &&
                !r.karbonite_map[next.y][next.x] && !r.fuel_map[next.y][next.x]) {
                return r.move(moves[i].x,moves[i].y);
            }
        }
    }

    if (r.mode === constants.CRUSADER_MODE.PATH_TO_CHURCH) {

        return mode.travel_to_goal(r,2,2,r.goal_map);
    }


    // let visible = r.getVisibleRobots();
    // for (let i = 0;i < visible.length;i++) {
    //     let robot = visible[i];
    //     if (robot.team === r.me.team && robot.unit === SPECS.CASTLE);
    //     if (r.isRadioing(robot) && robot.signal === 15) {
    //         r.log("CHAAAAAAAARGE");
    //         r.mode = constants.CRUSADER_MODE.CHAAAAAAAARGE;
    //         r.goal_map = util.BFSMap(r.map, util.getReflectedCoord(r.parent_castle_coords,r), util.getMoves(3));
    //     }
    // }
    // if (r.fuel < 300 && r.currentJob.code !== constants.CRUSADER_JOBS.DEFEND_ENEMY_CHURCH) return;
    // if (r.mode === constants.CRUSADER_MODE.CHAAAAAAAARGE) {
    //     let attack = combat.attack_nearest_castle(r,SPECS.CRUSADER,r.parent_castle_coords);
    //     if (attack !== undefined) {
    //         return r.attack(attack.x,attack.y);
    //     }
    //     return mode.travel_to_goal(r,3,2,r.goal_map);
    //
    // }
    // let distance_to_goal = (r.me.x - r.currentJob.x) ** 2 + (r.me.y - r.currentJob.y) ** 2;
    //
    //
    //
    // if (r.mode !== constants.CRUSADER_MODE.DEFEND &&
    //     ((r.currentJob.x === r.me.x && r.currentJob.y === r.me.y) ||(rmap[r.currentJob.y][r.currentJob.x] > 0 && distance_to_goal <= 2))) {
    //     //r.log("CHANGE MODE TO DEFEND");
    //     r.mode = constants.CRUSADER_MODE.DEFEND;
    // }  else if (r.mode !== constants.CRUSADER_MODE.PATH_TO_GOAL && distance_to_goal > 2) {
    //     //r.log("CHANGE MODE TO PATH TO GOAL");
    //     r.mode = constants.CRUSADER_MODE.PATH_TO_GOAL;
    // }





    if (r.mode === constants.CRUSADER_MODE.DEFEND) {
        return;
    }




}

export function crusader_step(r) {

    if (r.step === 0) {
        init(r);
    } else
        r.castleTalk(124);
    return step(r);



}