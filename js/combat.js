import * as util from "./util.js";
import {SPECS} from 'battlecode';



const dir_coord = [{x:0,y:-1}, {x:1,y:-1}, {x:1,y:0}, {x:1,y:1}, {x:0,y:1}, {x:-1,y:1}, {x:-1,y:0}, {x:-1,y:-1}];

export function damageMap(r) {
    let damageMap = util.create2dArray(r.size,r.size,0);
    let robots = r.getVisibleRobots();
    for (let i = 0;i < robots.length;i++) {

        let robot = robots[i];

        r.log(robot.id);
        if(!r.isVisible(robot) || r.me.team === robot.team) continue;
        if (robot.unit === SPECS.PILGRIM || robot.unit === SPECS.CASTLE || robot.unit === SPECS.CHURCH) continue;
        r.log('enemy robot');
        let attackRange = getAttackRange(robot.unit);
        r.log(attackRange);
        let damage = SPECS.UNITS[robot.unit].ATTACK_DAMAGE;
        r.log(damage);

        for (let j = 0;j < attackRange.length;j++) {
            let coord = {x:robot.x + attackRange[j].x,y:robot.y + attackRange[j].y};
            if (!util.withInMap(coord,r)) continue;
            damageMap[coord.y][coord.x] += damage;
        }
    }
    r.log(damageMap);

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
