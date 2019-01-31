import * as util from "./util.js";
import {SPECS} from 'battlecode';
import * as combat from "./combat.js";
import * as wallutil from "./wallutil.js";




export function travel_to_goal(r,radius,tolerance,goalMap) {
    let dir = goalMap[r.me.y][r.me.x];

    return util.fuzzyMove(r,-dir.x,-dir.y,radius,tolerance);
}
export function travel_to_goal_pilgrim(r,goalMap,passable_map,start,moves) {
    if (r.wait2 === undefined) r.wait2 = 0;
    let rmap = r.getVisibleRobotMap();
    let move = goalMap[r.me.y][r.me.x];
    //r.log('position ' + r.me.x + ', ' + r.me.y);
    let next_location = {x:r.me.x - move.x,y:r.me.y - move.y};
    if (next_location.x === start.x && next_location.y === start.y && rmap[next_location.y][next_location.x] > 0) {
        return;
    }
    //r.log(move);

    if (move === 0 || move === 99) {
        r.wait2++;
        return;
    }

    let next = {x:r.me.x - move.x,y:r.me.y - move.y};
    //r.log(next);
    if (rmap[next.y][next.x] === 0) {
        //r.log("SOMEONE IS AT: " + next.y + ", " + next.x);
        r.wait2 = 0;
        r.lastMove = move;
        return r.move(-move.x,-move.y);
    } else if (r.wait2 > 2 && r.me.time > 100) {
        //r.log("REROUTING to" + r.currentJob.x + ', ' + r.currentJob.y);
        r.wait2 = 0;
        let new_goal_map = util.BFSMap_with_rmap(passable_map, start, moves,r);
        return travel_to_goal_pilgrim(r,new_goal_map,passable_map,start,moves);
    } else {
        r.wait2++;

    }
}
export function travel_to_goal_castle(r,goalMap,passable_map,start,moves) {
    if (r.wait2 === undefined) r.wait2 = 0;
    let rmap = r.getVisibleRobotMap();
    let move = goalMap[r.me.y][r.me.x];
    //r.log('position ' + r.me.x + ', ' + r.me.y);
    let next_location = {x:r.me.x - move.x,y:r.me.y - move.y};
    if (next_location.x === start.x && next_location.y === start.y && rmap[next_location.y][next_location.x] > 0) {
        return;
    }
    //r.log(move);

    if (move === 0 || move === 99) {
        r.wait2++;
        return;
    }

    let next = {x:r.me.x - move.x,y:r.me.y - move.y};
    //r.log(next);
    if (rmap[next.y][next.x] === 0) {
        //r.log("SOMEONE IS AT: " + next.y + ", " + next.x);
        r.wait2 = 0;
        return r.move(-move.x,-move.y);
    } else if (r.wait2 > 2 && r.me.time > 100) {
        //r.log("REROUTING to" + r.currentJob.x + ', ' + r.currentJob.y);
        r.wait2 = 0;
        let new_goal_map = util.BFSMap_with_rmap_castle(passable_map, start, moves,r);
        return travel_to_goal_castle(r,new_goal_map,passable_map,start,moves);
    } else {
        r.wait2++;

    }
}
export function travel_to_goal5(r,moves) {
    if (r.wait === undefined) r.wait = 0;
    let rmap = r.getVisibleRobotMap();
    let move = r.goal_map[r.me.y][r.me.x];
    //r.log('position ' + r.me.x + ', ' + r.me.y);
    let next_location = {x:r.me.x - move.x,y:r.me.y - move.y};

    if (next_location.x === r.currentJob.x && next_location.y === r.currentJob.y && rmap[next_location.y][next_location.x] > 0) {
        return;
    }
    //r.log(move);

    if (move === 0 || move === 99) {
        r.wait++;
        return;
    }

    let next = {x:r.me.x - move.x,y:r.me.y - move.y};
    //r.log(next);
    if (rmap[next.y][next.x] === 0) {
        //r.log("SOMEONE IS AT: " + next.y + ", " + next.x);
        r.wait = 0;
        return r.move(-move.x,-move.y);
    } else if (r.wait > 1 && r.me.time > 100) {
        //r.log("REROUTING to" + r.currentJob.x + ', ' + r.currentJob.y);
        r.wait = 0;
        r.goal_map = util.BFSMap_with_rmap(r.map, {x: r.currentJob.x, y: r.currentJob.y}, moves,r);
        return travel_to_goal5(r,moves);
    } else {
        r.wait++;

    }
}
export function travel_to_goal_enemy_church(r,moves) {
    if (r.wait === undefined) r.wait = 0;
    let rmap = r.getVisibleRobotMap();
    let move = r.goal_map[r.me.y][r.me.x];
    //r.log('position ' + r.me.x + ', ' + r.me.y);
    let next_location = {x:r.me.x - move.x,y:r.me.y - move.y};

    if (next_location.x === r.currentJob.x && next_location.y === r.currentJob.y) {
        return;
    }
    //r.log(move);

    if (move === 0 || move === 99) {
        r.wait++;
        return;
    }

    let next = {x:r.me.x - move.x,y:r.me.y - move.y};
    //r.log(next);
    if (rmap[next.y][next.x] === 0) {
        //r.log("SOMEONE IS AT: " + next.y + ", " + next.x);
        r.wait = 0;
        return r.move(-move.x,-move.y);
    } else if (r.wait > 1 && r.me.time > 100) {
        //r.log("REROUTING to" + r.currentJob.x + ', ' + r.currentJob.y);
        r.wait = 0;
        r.goal_map = util.BFSMap_near_church(r.map, {x: r.currentJob.x, y: r.currentJob.y}, moves,r);
        return travel_to_goal_enemy_church(r,moves);
    } else {
        r.wait++;

    }
}

export function travel_to_attack_goal(r,moves) {
    if (r.wait === undefined) r.wait = 0;
    let rmap = r.getVisibleRobotMap();
    let move = r.goal_map[r.me.y][r.me.x];
    //r.log('position ' + r.me.x + ', ' + r.me.y);

    //r.log(move);

    if (move === 0 || move === 99) {
        r.wait++;
        return;
    }

    let next = {x:r.me.x - move.x,y:r.me.y - move.y};
    //r.log(next);
    if (rmap[next.y][next.x] === 0) {
        //r.log("SOMEONE IS AT: " + next.y + ", " + next.x);
        r.wait = 0;
        return r.move(-move.x,-move.y);
    } else if (r.wait > 1 && r.me.time > 100) {
        //r.log("REROUTING to" + r.currentJob.x + ', ' + r.currentJob.y);
        r.wait = 0;
        r.goal_map = util.BFSMap_with_rmap(r.safetyMap, {x: r.currentJob.x, y: r.currentJob.y}, moves,r);
        return travel_to_attack_goal(r,moves);
    } else {
        r.wait++;
    }
}

export function defend(r) {

}

export function attack(r,unit) {
    const attack = combat.simple_attack(r,unit);
    return r.attack(attack.x,attack.y);
}

export function prophet_attack(r,castleCoords) {
    let robots = r.getVisibleRobots();
    let enemy_signaled = [];
    for (let i = 0;i < robots.length;i++) {
        let robot = robots[i];
        if (robot.team === r.me.team && robot.unit === SPECS.PROPHET && r.isRadioing(robot) && robot.signal_radius === 65) {
            let signal = util.decodeCoords(robot.signal);
            enemy_signaled.push(signal);
        }
    }
    //r.log("enemy signaled:");
    //r.log(enemy_signaled);
    let possible_signals = [];
    for (let i = 0;i < robots.length;i++) {
        let robot = robots[i];
        if (robot.team !== r.me.team && (robot.unit === SPECS.CRUSADER || robot.unit === SPECS.PREACHER)) {
            let signaled = false;
            for (let j = 0;j < enemy_signaled.length;j++) {
                let enemy = enemy_signaled[j];
                if ( enemy.x === robot.x && enemy.y === robot.y) {
                    signaled = true;
                    break;
                }
            }
            if (!signaled) {
                let signal = util.signalCoords(robot.x,robot.y,robot.unit);
                r.signal(signal,65);
                r.log(r.me.id + " HAS ENEMY FOUND, SIGNALING" );
                r.log(util.decodeCoords(signal));
                break;
            }
        }
    }
    //let damageMap = combat.damageMap(r);
    //r.log("damage to me: " + damageMap[r.me.y][r.me.x]);
    let prophetAttack = combat.attack_prophet_nearest_location(r,SPECS.PROPHET,{x:r.me.x,y:r.me.y});
    if (prophetAttack !== undefined) {
        return r.attack(prophetAttack.x,prophetAttack.y);
    }
    let noncombatAttack = combat.attack_noncombat_nearest_location(r,SPECS.PROPHET,{x:r.me.x,y:r.me.y});
    if (noncombatAttack !== undefined) {
        return r.attack(noncombatAttack.x,noncombatAttack.y);
    }
    //return combat.prophet_kiting(r, damageMap);
    let attack = combat.attack_nearest_castle(r,SPECS.PROPHET,castleCoords);
    if (attack !== undefined) {
        let attackLocation = {x: r.me.x + attack.x, y: r.me.y + attack.y};
        let distance_from_castle = Math.max(Math.abs(attackLocation.x - castleCoords.x), Math.abs(attackLocation.y - castleCoords.y));
        return r.attack(attack.x, attack.y);
    }
}
export function prophet_attack_offensive(r) {
    let robots = r.getVisibleRobots();
    let enemy_signaled = [];
    for (let i = 0;i < robots.length;i++) {
        let robot = robots[i];
        if (robot.team === r.me.team && robot.unit === SPECS.PROPHET && r.isRadioing(robot) && robot.signal_radius === 65) {
            let signal = util.decodeCoords(robot.signal);
            enemy_signaled.push(signal);
        }
    }
    //r.log("enemy signaled:");
    //r.log(enemy_signaled);
    let possible_signals = [];
    for (let i = 0;i < robots.length;i++) {
        let robot = robots[i];
        if (robot.team !== r.me.team && (robot.unit === SPECS.CRUSADER || robot.unit === SPECS.PREACHER)) {
            let signaled = false;
            for (let j = 0;j < enemy_signaled.length;j++) {
                let enemy = enemy_signaled[j];
                if ( enemy.x === robot.x && enemy.y === robot.y) {
                    signaled = true;
                    break;
                }
            }
            if (!signaled) {
                let signal = util.signalCoords(robot.x,robot.y,robot.unit);
                r.signal(signal,65);
                r.log(r.me.id + " HAS ENEMY FOUND, SIGNALING" );
                r.log(util.decodeCoords(signal));
                break;
            }
        }
    }
    //let damageMap = combat.damageMap(r);
    //r.log("damage to me: " + damageMap[r.me.y][r.me.x]);
    let prophetAttack = combat.attack_prophet_nearest_location(r,SPECS.PROPHET,{x:r.me.x,y:r.me.y});
    if (prophetAttack !== undefined) {
        return r.attack(prophetAttack.x,prophetAttack.y);
    }
    let noncombatAttack = combat.attack_noncombat_nearest_location(r,SPECS.PROPHET,{x:r.me.x,y:r.me.y});
    if (noncombatAttack !== undefined) {
        return r.attack(noncombatAttack.x,noncombatAttack.y);
    }

    //return combat.prophet_kiting(r, damageMap);
    let attack = combat.attack_nearest_castle(r,SPECS.PROPHET,{x:r.me.x,y:r.me.y});
    if (attack !== undefined) {
        let attackLocation = {x: r.me.x + attack.x, y: r.me.y + attack.y};
        let distance_from_me = (attackLocation.x - r.me.x) ** 2 + (attackLocation.y - r.me.y) ** 2;
        return r.attack(attack.x, attack.y);

    }
}

export function moveToFrontLines(r,unitlessMap) {

    let rmap = r.getVisibleRobotMap();
    let move = r.frontLineMap[r.me.y][r.me.x];
    //r.log('position ' + r.me.x + ', ' + r.me.y);
    r.log("MOVVVVEEE:");
    r.log(move);

    if (move === 0 || move === 99) {
        return;
    }
    const next = {x:r.me.x - move.x, y: r.me.y - move.y};
    if(util.withInMap(next, r) && unitlessMap[next.y][next.x] && rmap[next.y][next.x] === 0)
        return r.move(-move.x, -move.y);


    let moves = util.getFuzzyMoves(r,-move.x,-move.y,2,1);
    for (let i = 0;i < moves.length;i++) {

        const next = {x:r.me.x + moves[i].x,y:r.me.y + moves[i].y};

        if (util.withInMap(next,r) && unitlessMap[next.y][next.x] && rmap[next.y][next.x] === 0) {

            return r.move(moves[i].x,moves[i].y);
        }
    }



}

export function prophet_move_away(r) {
    let robots = r.getVisibleRobots();
    let enemyLocation;
    for (let i =0;i < robots.length;i++) {
        let robot = robots[i];
        if (r.isVisible(robot) && robot.team !== r.me.team) {
            let distance = (robot.x - r.me.x) ** 2 + (robot.y - r.me.y) ** 2;
            if (distance <= 16) {
                enemyLocation = {x:robot.x,y:robot.y};
            }

        }
    }
    let moves = util.getMoves(2);
    let max_distance = 0;
    let move;
    for (let i = 0;i < moves.length;i++) {
        let next = {x:r.me.x + moves[i].x,y:r.me.y + moves[i].y};
        if (util.withInMap(next,r) && r.map[next.y][next.x] && rmap[next.y][next.x] === 0) {
            let distance = (next.x - enemyLocation.x) ** 2 + (next.y - enemyLocation.y) ** 2;
            if (distance > max_distance) {
                move = moves[i];
            }

        }
    }
    return r.move(move.x,move.y);
}





