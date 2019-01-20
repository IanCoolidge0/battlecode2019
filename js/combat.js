import * as util from "./util.js";
import {SPECS} from 'battlecode';



const dir_coord = [{x:0,y:-1}, {x:1,y:-1}, {x:1,y:0}, {x:1,y:1}, {x:0,y:1}, {x:-1,y:1}, {x:-1,y:0}, {x:-1,y:-1}];


export function enemyInRange(r) {
    let robots = r.getVisibleRobots();
    for (let i =0;i < robots.length;i++) {
        let robot = robots[i];
        if (r.isVisible(robot) && robot.team !== r.me.team) {
            return true;
        }
    }
    return false;
}
export function enemyCombatInRange(r) {
    let robots = r.getVisibleRobots();
    for (let i =0;i < robots.length;i++) {
        let robot = robots[i];

        if (r.isVisible(robot) && robot.team !== r.me.team) {
            if (robot.unit === SPECS.PILGRIM || robot.unit === SPECS.CASTLE || robot.unit === SPECS.CHURCH) continue;
            return true;
        }
    }
    return false;
}

export function simple_attack(r,unit) {
    let robots = r.getVisibleRobots();
    for (let i = 0; i < robots.length;i++) {
        let robot = robots[i];
        if (!r.isVisible(robot) || robot.team === r.me.team) continue;
        const distance = (r.me.x - robot.x) ** 2 + (r.me.y - robot.y) ** 2;
        if (SPECS.UNITS[unit].ATTACK_RADIUS[0] <= distance && distance <= SPECS.UNITS[unit].ATTACK_RADIUS[1]) {
            return {x:robot.x - r.me.x,y:robot.y - r.me.y};
        }

    }
}

export function get_attacks(r,unit) {
    let robots = r.getVisibleRobots();
    let attacks = [];
    for (let i = 0; i < robots.length;i++) {
        let robot = robots[i];
        if (!r.isVisible(robot) || robot.team === r.me.team) continue;
        const distance = (r.me.x - robot.x) ** 2 + (r.me.y - robot.y) ** 2;
        if (SPECS.UNITS[unit].ATTACK_RADIUS[0] <= distance && distance <= SPECS.UNITS[unit].ATTACK_RADIUS[1]) {
            attacks.push({x:robot.x - r.me.x,y:robot.y - r.me.y});
        }

    }
    return attacks;

}
// export function attack_lowest(r,unit) {
//
//     let attacks = get_attacks(r,unit);
//     r.log('attacks');
//     r.log(attacks);
//     if (attacks.length === 0) return;
//
//     let rmap = r.getVisibleRobotMap();
//     let lowest = 300;
//     let lowest_index = -1;
//     for (let i = 0;i < attacks.length;i++) {
//         let next = {x:r.me.x + attacks[i].x, y:r.me.y + attacks[i].y};
//         let enemy = r.getRobot(rmap[next.y][next.x]);
//         r.log(enemy.id);
//         r.log(enemy.health);
//         if (enemy.health < lowest) {
//             lowest = enemy.health;
//             lowest_index = i;
//         }
//     }
//     r.log('index' + lowest_index);
//     return attacks[lowest_index];
//
// }


export function prophet_kiting(r,damageMap) {
    if (simple_attack(r,SPECS.PROPHET) === undefined) {

    }
    if (damageMap[r.me.y][r.me.x] === 0) {
        let attack = simple_attack(r,SPECS.PROPHET);

        if(attack !== undefined)
            return r.attack(attack.x,attack.y);
    }
    let moves = util.getMoves(2);
    let rmap = r.getVisibleRobotMap();
    for (let i = 0;i < moves.length;i++) {
        const next = {x:r.me.x + moves[i].x,y:r.me.y + moves[i].y};
        if (util.withInMap(next,r) && r.map[next.y][next.x] && damageMap[next.y][next.x] === 0 && rmap[next.y][next.x] === 0) {
            return r.move(moves[i].x,moves[i].y);

        }
    }
    if (r.me.health > 10) {
        if (damageMap[r.me.y][r.me.x] === 10) {
            let attack = simple_attack(r,SPECS.PROPHET);
            if(attack !== undefined)
                return r.attack(attack.x,attack.y);
        }
        for (let i = 0;i < moves.length;i++) {
            const next = {x:r.me.x + moves[i].x,y:r.me.y + moves[i].y};
            if (util.withInMap(next,r) && damageMap[next.y][next.x] === 10 && rmap[next.y][next.x] === 0) {
                return r.move(moves[i].x,moves[i].y);

            }
        }
    }
    let attack = simple_attack(r,SPECS.PROPHET);
    if(attack !== undefined)
        return r.attack(attack.x,attack.y);


}




export function damageMap(r) {
    let damageMap = util.create2dArray(r.map.length,r.map.length,0);

    let robots = r.getVisibleRobots();

    for (let i = 0;i < robots.length;i++) {

        let robot = robots[i];

        //r.log(robot.id);
        if(!r.isVisible(robot) || r.me.team === robot.team) continue;
        if (robot.unit === SPECS.PILGRIM || robot.unit === SPECS.CASTLE || robot.unit === SPECS.CHURCH) continue;
        //r.log('enemy robot');
        let attackRange = getAttackRange(robot.unit);
        //r.log(attackRange);
        let damage = SPECS.UNITS[robot.unit].ATTACK_DAMAGE;
        //r.log(damage);

        for (let j = 0;j < attackRange.length;j++) {
            let coord = {x:robot.x + attackRange[j].x,y:robot.y + attackRange[j].y};
            if (!util.withInMap(coord,r)) continue;
            damageMap[coord.y][coord.x] += damage;
        }
    }
    return  damageMap;

}

export function damageMap2(r) {
    let damageMap = util.create2dArray(r.map.length,r.map.length,0);

    let robots = r.getVisibleRobots();

    for (let i = 0;i < robots.length;i++) {

        let robot = robots[i];

        r.log(robot.id);
        if(!r.isVisible(robot) || r.me.team === robot.team) continue;
        r.log("visible");
        if (robot.unit === SPECS.PILGRIM || robot.unit === SPECS.CASTLE || robot.unit === SPECS.CHURCH) continue;
        r.log("combat");
        //r.log('enemy robot');
        let attackRange = getAttackRange(robot.unit);
        r.log(attackRange);
        let damage = SPECS.UNITS[robot.unit].ATTACK_DAMAGE;
        r.log("damage");
        r.log(damage);

        for (let j = 0;j < attackRange.length;j++) {

            let coord = {x:robot.x + attackRange[j].x,y:robot.y + attackRange[j].y};
            r.log(coord);
            r.log(util.withInMap(coord,r));
            if (!util.withInMap(coord,r)) continue;

            damageMap[coord.y][coord.x] += damage;
        }
    }
    return  damageMap;

}

export function getAttackRange(unit) {
    if(unit === SPECS.PILGRIM || unit === SPECS.CASTLE || unit === SPECS.CHURCH) {
        return [];
    } else if (unit === SPECS.CRUSADER) {
        return util.getMoves(4);
    } else if(unit === SPECS.PREACHER) {
        let attackRange = util.getMoves(5);
        let splashRange = [{x:5,y:1},{x:5,y:-1},{x:-5,y:1},{x:5,y:-1},{x:1,y:5},{x:-1,y:5},{x:1,y:-5},{x:-1,y:-5}];
        return attackRange.concat(splashRange);
    } else if(unit === SPECS.PROPHET) {
        let attackRange = [];
        let radius = 8;
        let min = 16;
        let max = 64;
        for(let i=-radius;i<=radius;i++) {
            for(let j=-radius;j<=radius;j++) {
                if(i === 0 && j === 0) continue;
                let distance = i ** 2 + j ** 2;
                if(distance >= min && distance <= max) {
                    attackRange.push({x:i,y:j});
                }
            }
        }
        return attackRange;
    }
}

export function bestCombatMoves(r,moves,damageMap) {
    let damageDict = {};
    for (let i  = 0;i < moves.length;i++) {}
        const loc = {x:r.me.x + moves[i].x, y:r.me.y + moves[i].y};

}

export function unitMap(r) {

    let map = util.create2dArray(r.size,r.size,false);
    for (let i = 0;i < r.size;i++) {
        for (let j = 0;j < r.size;j++) {
            if (i % 2 == 0 && j % 2 === 0 && r.map[j][i] && !r.karbonite_map[j][i] && !r.fuel_map[j][i]) {
                map[j][i] = true;
            }
        }
    }
    return map;
}


export function unitMap2(r) {

    let map = util.create2dArray(r.size, r.size, false);
    let enemyCastle = util.getReflectedCoord({x: r.me.x, y: r.me.y}, r);

    for(let i=0;i<r.size;i++) {
        for(let j=0;j<r.size;j++) {
            if(i % 2 === 0 && j % 2 === 0 && r.map[j][i] && !r.karbonite_map[j][i] && !r.fuel_map[j][i]) {
                let enemyCastleDir = util.directionTo(enemyCastle.x - r.me.x, enemyCastle.y - r.me.y);
                let unitDir = util.directionTo(i - r.me.x, j - r.me.y);

                if(util.similar(enemyCastleDir, unitDir))
                    map[j][i] = true;
            }
        }
    }
    //r.log(map);
    return map;
}

export function unitMap_odd(r) {

    let map = util.create2dArray(r.size,r.size,false);
    for (let i = 0;i < r.size;i++) {
        for (let j = 0;j < r.size;j++) {
            if (i % 2 === 1 && j % 2 === 1 && r.map[j][i] && !r.karbonite_map[j][i] && !r.fuel_map[j][i]) {
                map[j][i] = true;
            }
        }
    }
    return map;
}

export function next_unitLocation_odd(r,direction,unitMap) {
    let location;
    for (let i = 2;i < r.map.length;i++) {
        for (let j = -i;j <= i;j++) {
            location = {x:r.me.x + i, y:r.me.y + j};
            if (util.withInMap(location,r) && unitMap[location.y][location.x]) {
                let unitDir = util.directionTo(location.x - r.me.x, location.y - r.me.y);
                if (util.similar(unitDir,direction)) {
                    return location;
                }
            }
            location = {x:r.me.x - i, y:r.me.y + j};
            if (util.withInMap(location,r) && unitMap[location.y][location.x]) {
                let unitDir = util.directionTo(location.x - r.me.x, location.y - r.me.y);
                if (util.similar(unitDir,direction)) {
                    return location;
                }
            }
        }
        for (let j = -i + 1;j <= i - 1;j++) {

            location = {x:r.me.x + j, y:r.me.y + i};
            if (util.withInMap(location,r) && unitMap[location.y][location.x]) {
                let unitDir = util.directionTo(location.x - r.me.x, location.y - r.me.y);
                if (util.similar(unitDir,direction)) {
                    return location;
                }
            }
            location = {x:r.me.x + j, y:r.me.y - i};
            if (util.withInMap(location,r) && unitMap[location.y][location.x]) {
                let unitDir = util.directionTo(location.x - r.me.x, location.y - r.me.y);
                if (util.similar(unitDir,direction)) {
                    return location;
                }
            }
        }
    }
}

export function unitLocationsQueue(r,radius) {
    let unit_location_queue = [];

    let location;
    for (let i = 6;i < radius;i++) {

        for (let j = -i;j <= i;j++) {
            location = {x:r.me.x + i, y:r.me.y + j};
            if (util.withInMap(location,r) && r.unitMap[location.y][location.x]) {
                unit_location_queue.push(location);
            }
            location = {x:r.me.x - i, y:r.me.y + j};
            if (util.withInMap(location,r) && r.unitMap[location.y][location.x]) {
                unit_location_queue.push(location);
            }
        }
        for (let j = -i + 1;j <= i - 1;j++) {

            location = {x:r.me.x + j, y:r.me.y + i};
            if (util.withInMap(location,r) && r.unitMap[location.y][location.x]) {
                unit_location_queue.push(location);
            }
            location = {x:r.me.x + j, y:r.me.y - i};
            if (util.withInMap(location,r) && r.unitMap[location.y][location.x]) {
                unit_location_queue.push(location);
            }
        }
    }
    r.log(unit_location_queue);
    return unit_location_queue;
}


