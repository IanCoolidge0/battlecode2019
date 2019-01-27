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
        r.goal_map = util.BFSMap_with_rmap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2),r);
    } else if(r.currentJob.code === constants.CRUSADER_JOBS.DEFEND_ENEMY_CHURCH) {
        r.mode = constants.CRUSADER_MODE.PATH_TO_CHURCH;
        r.safety_map = util.safetyMap(r, [util.getReflectedCoord(r.parent_castle_coords, r)]);

        r.goal_map = util.BFSMap(r.safety_map, {x: r.currentJob.x, y: r.currentJob.y}, util.getMoves(2));
    }

}
function pilgrimInRange(r) {
    let robots = r.getVisibleRobots();
    let enemyPilgrims = []
    for (let i = 0;i < robots.length;i++) {
        let robot = robots[i];
        if (r.isVisible(robot) && robot.unit === SPECS.PILGRIM && robot.team !== r.me.team) {
            enemyPilgrims.push({x:robot.x,y:robot.y});
        }
    }

    if (enemyPilgrims.length > 0) {
        let nearest = 99;
        let nearestCoord;
        for (let i = 0;i < enemyPilgrims.length;i++) {
            let distance = (enemyPilgrims[i].x - r.me.x) ** 2 + (enemyPilgrims[i].y - r.me.y) ** 2;
            if (distance < nearest) {
                nearest = distance;
                nearestCoord = enemyPilgrims[i];
            }
        }


        if (nearest <= 16) {
            let attack = {x:nearestCoord.x - r.me.x,y:nearestCoord.y - r.me.y};
            return r.attack(attack.x,attack.y);
        } else {
            let BFSMap = util.BFSMap_with_rmap(r.map,nearestCoord,util.getMoves(3),r);
            let move = BFSMap[r.me.y][r.me.x];
            if (move !== 0 && move !== 99) {
                return r.move(-move.x,-move.y);
            }
        }

    }
}


export function step(r) {
    if (r.currentJob.code === constants.CRUSADER_JOBS.DEFEND_ENEMY_CHURCH) {
        let rmap = r.getVisibleRobotMap();
        let pilgrimMove = pilgrimInRange(r);
        if (pilgrimMove !== undefined) {
            return pilgrimMove;
        }

        let distanceToGoal = (r.currentJob.y - r.me.y) ** 2 + (r.currentJob.x - r.me.x) ** 2;
        if (r.currentJob.code === constants.CRUSADER_JOBS.DEFEND_ENEMY_CHURCH && r.mode === constants.CRUSADER_MODE.PATH_TO_CHURCH &&
            ((r.currentJob.x === r.me.x && r.currentJob.y === r.me.y) || (rmap[r.currentJob.y][r.currentJob.x] > 0 && distanceToGoal < 4))) {


            let moves = util.getMoves(2);

            for (let i = 0; i < moves.length; i++) {
                let next = {x: r.me.x + moves[i].x, y: r.me.y + moves[i].y};
                if (util.withInMap(next, r) && rmap[next.y][next.x] === 0 && r.map[next.y][next.x] &&
                    !r.karbonite_map[next.y][next.x] && !r.fuel_map[next.y][next.x]) {
                    r.mode = constants.CRUSADER_MODE.DEFEND;
                    r.currentJob.x = r.me.x + moves[i].x;
                    r.currentJob.y = r.me.y + moves[i].y;
                    r.goal_map = util.BFSMap_with_rmap(r.map, {
                        x: r.currentJob.x,
                        y: r.currentJob.y
                    }, util.getMoves(3), r);
                    return r.move(moves[i].x, moves[i].y);
                }
            }
            moves = util.getMoves(3);
            for (let i = 0; i < moves.length; i++) {
                let next = {x: r.me.x + moves[i].x, y: r.me.y + moves[i].y};
                if (util.withInMap(next, r) && rmap[next.y][next.x] === 0 && r.map[next.y][next.x] &&
                    !r.karbonite_map[next.y][next.x] && !r.fuel_map[next.y][next.x]) {
                    r.mode = constants.CRUSADER_MODE.DEFEND;
                    r.currentJob.x = r.me.x + moves[i].x;
                    r.currentJob.y = r.me.y + moves[i].y;
                    r.goal_map = util.BFSMap_with_rmap(r.map, {
                        x: r.currentJob.x,
                        y: r.currentJob.y
                    }, util.getMoves(3), r);
                    return r.move(moves[i].x, moves[i].y);
                }
            }
        }

        if (r.mode === constants.CRUSADER_MODE.PATH_TO_CHURCH) {

            return mode.travel_to_goal5(r, util.getMoves(3));
        }

        if (combat.enemyInAttackRange(r, 16)) {
            //r.log("CHANGE MODE TO ATTACK");
            r.mode = constants.CRUSADER_MODE.ATTACK;
        } else if (r.mode !== constants.CRUSADER_MODE.DEFEND &&
            ((r.currentJob.x === r.me.x && r.currentJob.y === r.me.y) || (rmap[r.currentJob.y][r.currentJob.x] > 0 && distanceToGoal < 4))) {
            //r.log("CHANGE MODE TO DEFEND");
            r.mode = constants.CRUSADER_MODE.DEFEND;
        } else if (r.mode !== constants.CRUSADER_MODE.PATH_TO_GOAL && distanceToGoal >= 4) {
            //r.log("CHANGE MODE TO PATH TO GOAL");
            r.mode = constants.CRUSADER_MODE.PATH_TO_GOAL;
        }

        if (r.mode === constants.CRUSADER_MODE.ATTACK) {
            let attack = combat.crusader_attack(r);
            if (attack !== undefined) {
                return r.attack(attack.x, attack.y);
            }
        }
        if (r.mode === constants.PROPHET_MODE.PATH_TO_GOAL) {
            //r.log('moving');

            return mode.travel_to_goal5(r, util.getMoves(3));
        }
        if (r.mode === constants.PROPHET_MODE.DEFEND) {
            return;
        }
    }
    if (r.currentJob.code === constants.CRUSADER_JOBS.DEFEND_GOAL) {
        let distance_to_goal = (r.me.x - r.currentJob.x) + (r.me.y - r.currentJob.y);
        if (combat.enemyInAttackRange(r, 16) && r.fuel > 2358) {
            //r.log("CHANGE MODE TO ATTACK");
            r.mode = constants.CRUSADER_MODE.ATTACK;
        } else if (r.mode !== constants.CRUSADER_MODE.DEFEND && r.currentJob.x === r.me.x && r.currentJob.y === r.me.y) {
            r.mode = constants.CRUSADER_MODE.DEFEND;
        } else if (r.mode !== constants.CRUSADER_MODE.PATH_TO_GOAL && distance_to_goal > 1) {
            //r.log("CHANGE MODE TO PATH TO GOAL");
            r.mode = constants.CRUSADER_MODE.PATH_TO_GOAL;
        }
        if (r.mode === constants.CRUSADER_MODE.ATTACK && r.fuel > 2358) {
            let attack = combat.crusader_attack(r);
            if (attack !== undefined) {
                return r.attack(attack.x, attack.y);
            }
        }
        if (r.mode === constants.CRUSADER_MODE.PATH_TO_GOAL) {
            return mode.travel_to_goal5(r,util.getMoves2(2));
        }
        if (r.mode === constants.CRUSADER_MODE.DEFEND) {
            return;
        }



    }
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











export function crusader_step(r) {

    if (r.step === 0) {
        init(r);
    } else
        r.castleTalk(124);
    return step(r);



}