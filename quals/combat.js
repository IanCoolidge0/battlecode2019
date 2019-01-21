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

export function preacher_best_attack(r) {
    let dir_coord = [{x:-1,y:-1}, {x:-1,y:0}, {x:-1,y:1}, {x:0,y:1}, {x:1,y:1}, {x:1,y:0}, {x:1,y:-1}, {x:0,y:-1}];
    let rmap = r.getVisibleRobotMap();
    let attacks = util.getMoves(4);
    let highest_value = -1;
    let highest_value_index = -1;
    let robot;
    for (let i = 0;i < attacks.length;i++) {
        let coord = {x:r.me.x + attacks[i].x, y:r.me.y + attacks[i].y};
        let value = 0;
        if (!util.withInMap(coord,r)) continue;

        if (rmap[coord.y][coord.x] !== -1 && rmap[coord.y][coord.x] !== 0) {
            robot = r.getRobot(rmap[coord.y][coord.x]);
            if (robot.team === r.me.team) {
                if (robot.unit === SPECS.CASTLE) {
                    value -= 5;
                } else {
                    value -= 1.5;
                }
            } else {
                value++;
            }
        }

        //calculate splash value
        for (let j = 0;j < dir_coord.length;j++) {
            let splash_coord = {x:coord.x + dir_coord[j].x, y:coord.y + dir_coord[j].x};
            if (!util.withInMap(splash_coord,r)) continue;

            if (rmap[splash_coord.y][splash_coord.x] !== -1 && rmap[splash_coord.y][splash_coord.x] !== 0) {
                robot = r.getRobot(rmap[splash_coord.y][splash_coord.x]);
                if (robot.team === r.me.team) {
                    if (robot.unit === SPECS.CASTLE) {
                        value -= 5;
                    } else {
                        value -= 1.5;
                    }
                } else {
                    value++;
                }
            }
        }

        if (value > highest_value) {
            highest_value = value;
            highest_value_index = i;
        }
    }

    if (highest_value > 0) {
        return attacks[highest_value_index];

    }

}

export function amount_of_enemy(r) {
    let robots = r.getVisibleRobots();
    let count = {3:0,4:0,5:0};
    for (let i = 0;i < robots.length;i++) {
        let robot = robots[i];
        if(!r.isVisible(robot) || r.me.team === robot.team) continue;
        if (robot.unit === SPECS.PILGRIM || robot.unit === SPECS.CASTLE || robot.unit === SPECS.CHURCH) continue;
        count[robot.unit]++;

    }
    return count;
}

export function attack_nearest_castle(r,unit,castleCoords) {
    let robots = r.getVisibleRobots();
    let nearest = 9999;
    let coord;
    for (let i = 0; i < robots.length;i++) {
        let robot = robots[i];
        if (!r.isVisible(robot) || robot.team === r.me.team) continue;
        const distance = (r.me.x - robot.x) ** 2 + (r.me.y - robot.y) ** 2;
        if (SPECS.UNITS[unit].ATTACK_RADIUS[0] <= distance && distance <= SPECS.UNITS[unit].ATTACK_RADIUS[1]) {
            const castle_distance = (robot.x - castleCoords.x) ** 2 + (robot.y - castleCoords.y) ** 2;
            if (castle_distance < nearest) {
                nearest = castle_distance;
                coord = {x:robot.x,y:robot.y};
            }
        }

    }
    if (nearest === 9999) return;

    return  {x:coord.x - r.me.x,y:coord.y - r.me.y};

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
        r.log('attack');
        r.log(attack);
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
            if(((i % 2 === 0 &&  j % 2 == 0) || (i % 2 === 1 &&  j % 2 == 1) ) && r.map[j][i] && !r.karbonite_map[j][i] && !r.fuel_map[j][i]) {
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

export function unitMap2_odd(r) {
    let map = util.create2dArray(r.size, r.size, false);
    let enemyCastle = util.getReflectedCoord({x: r.me.x, y: r.me.y}, r);

    for(let i=0;i<r.size;i++) {
        for(let j=0;j<r.size;j++) {
            if(i % 2 === 1 && j % 2 === 1 && r.map[j][i] && !r.karbonite_map[j][i] && !r.fuel_map[j][i]) {
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

export function unitMap2_other(r) {
    let map = util.create2dArray(r.size, r.size, false);
    let enemyCastle = util.getReflectedCoord({x: r.me.x, y: r.me.y}, r);

    for(let i=0;i<r.size;i++) {
        for(let j=0;j<r.size;j++) {
            if(((i % 2 === 1 &&  j % 2 == 0) || (i % 2 === 0 &&  j % 2 == 1) ) && r.map[j][i] && !r.karbonite_map[j][i] && !r.fuel_map[j][i]) {
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

export function unitMap2_crusader(r) {
    let map = util.create2dArray(r.size, r.size, false);
    let enemyCastle = util.getReflectedCoord({x: r.me.x, y: r.me.y}, r);

    for(let i=0;i<r.size;i++) {
        for(let j=0;j<r.size;j++) {
            if(r.map[j][i] && !r.karbonite_map[j][i] && !r.fuel_map[j][i]) {
                let enemyCastleDir = util.directionTo(r.me.x - enemyCastle.x , r.me.y - enemyCastle.y );
                let unitDir = util.directionTo(i - r.me.x, j - r.me.y);

                if(util.similar(enemyCastleDir, unitDir))
                    map[j][i] = true;
            }
        }
    }
    //r.log(map);
    return map;
}
export function unitMap2_crusader2(r) {
    let map = util.create2dArray(r.size, r.size, false);
    let enemyCastle = util.getReflectedCoord({x: r.me.x, y: r.me.y}, r);

    for(let i=0;i<r.size;i++) {
        for(let j=0;j<r.size;j++) {
            if(r.map[j][i] && !r.karbonite_map[j][i] && !r.fuel_map[j][i]) {
                let enemyCastleDir = util.directionTo(r.me.x - enemyCastle.x , r.me.y - enemyCastle.y );
                let enemyCastleDir2 = util.rotateRight(enemyCastleDir,1);
                let enemyCastleDir3 = util.rotateLeft(enemyCastleDir,1)
                let unitDir = util.directionTo(i - r.me.x, j - r.me.y);

                if(util.similar(enemyCastleDir2, unitDir) || util.similar(enemyCastleDir3,unitDir));
                    map[j][i] = true;
            }
        }
    }
    //r.log(map);
    return map;
}

export function next_unitLocation_odd(r,direction,unitMap) {
    let location;
    for (let i = 2;i < r.map.length;i++) {
        for (let j = -i;j <= i;j++) {
            location = {x:r.me.x + i, y:r.me.y + j};
            if (util.withInMap(location,r) && unitMap[location.y][location.x]) {
                let unitDir = util.directionTo(location.x - r.me.x, location.y - r.me.y);
                if (unitDir.x === direction.x && unitDir.y === direction.y) {
                    return location;
                }
            }
            location = {x:r.me.x - i, y:r.me.y + j};
            if (util.withInMap(location,r) && unitMap[location.y][location.x]) {
                let unitDir = util.directionTo(location.x - r.me.x, location.y - r.me.y);
                if (unitDir.x === direction.x && unitDir.y === direction.y) {
                    return location;
                }
            }
        }
        for (let j = -i + 1;j <= i - 1;j++) {

            location = {x:r.me.x + j, y:r.me.y + i};
            if (util.withInMap(location,r) && unitMap[location.y][location.x]) {
                let unitDir = util.directionTo(location.x - r.me.x, location.y - r.me.y);
                if (unitDir.x === direction.x && unitDir.y === direction.y) {
                    return location;
                }
            }
            location = {x:r.me.x + j, y:r.me.y - i};
            if (util.withInMap(location,r) && unitMap[location.y][location.x]) {
                let unitDir = util.directionTo(location.x - r.me.x, location.y - r.me.y);
                if (unitDir.x === direction.x && unitDir.y === direction.y) {
                    return location;
                }
            }
        }
    }
}

export function unitLocationsQueue(r, inRadius, outRadius, unitMap, inward) {
    let unit_location_queue = [];

    let location;

    if (!inward) {
        for (let i = inRadius; i <= outRadius; i++) {

            for (let j = -i; j <= i; j++) {
                location = {x: r.me.x + i, y: r.me.y + j};
                if (util.withInMap(location, r) && unitMap[location.y][location.x]) {
                    unit_location_queue.push(location);
                }
                location = {x: r.me.x - i, y: r.me.y + j};
                if (util.withInMap(location, r) && unitMap[location.y][location.x]) {
                    unit_location_queue.push(location);
                }
            }
            for (let j = -i + 1; j <= i - 1; j++) {

                location = {x: r.me.x + j, y: r.me.y + i};
                if (util.withInMap(location, r) && unitMap[location.y][location.x]) {
                    unit_location_queue.push(location);
                }
                location = {x: r.me.x + j, y: r.me.y - i};
                if (util.withInMap(location, r) && unitMap[location.y][location.x]) {
                    unit_location_queue.push(location);
                }
            }
        }
    } else {
        for (let i = outRadius; i >= inRadius; i--) {

            for (let j = -i; j <= i; j++) {
                location = {x: r.me.x + i, y: r.me.y + j};
                if (util.withInMap(location, r) && unitMap[location.y][location.x]) {
                    unit_location_queue.push(location);
                }
                location = {x: r.me.x - i, y: r.me.y + j};
                if (util.withInMap(location, r) && unitMap[location.y][location.x]) {
                    unit_location_queue.push(location);
                }
            }
            for (let j = -i + 1; j <= i - 1; j++) {

                location = {x: r.me.x + j, y: r.me.y + i};
                if (util.withInMap(location, r) && unitMap[location.y][location.x]) {
                    unit_location_queue.push(location);
                }
                location = {x: r.me.x + j, y: r.me.y - i};
                if (util.withInMap(location, r) && unitMap[location.y][location.x]) {
                    unit_location_queue.push(location);
                }
            }
        }
    }
    //r.log(unit_location_queue);
    return unit_location_queue;
}

export function unitPremap(r, radius) {
    let map = util.create2dArray(r.size, r.size, false);

    let coord = {x: r.me.x, y: r.me.y};
    let enemy_coord = util.getReflectedCoord(coord, r);

    let path_map = util.BFSMap(r.map, enemy_coord, util.getMoves(2));

    let path = [coord];
    while(coord.x !== enemy_coord.x || coord.y !== enemy_coord.y) {
        const dir = path_map[coord.y][coord.x];
        coord.x -= dir.x;
        coord.y -= dir.y;

        path.push(coord);
    }

    for(let i=0;i<path.length;i+=radius) {
        for(let j=-radius;j<=radius;j++) {
            for(let k=-radius;k<=radius;k++) {
                if(j ** 2 + k ** 2 > radius ** 2) continue;

                let newX = path[i].x + j;
                let newY = path[i].y + k;

                if(util.withInMap({x: newX, y: newY}, r) && r.map[newY][newX]) {
                    map[newY][newX] = true;
                }
            }
        }

    }

    return map;
}

export function unitMapAggressive(r, radius) {
    let map = util.create2dArray(r.map.length, r.map.length, false);

    let preMap = unitPremap(r, radius);

    for(let i=0;i<r.map.length;i++) {
        for(let j=0;j<r.map.length;j++) {
            if(i % 2 === j % 2 && preMap[j][i] && !r.karbonite_map[j][i] && !r.fuel_map[j][i]) {
                map[j][i] = true;
            }
        }
    }

    return map;
}

