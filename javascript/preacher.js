import {SPECS} from 'battlecode';
import * as util from "./util.js";
var MODE = {
    PATH_TO_GOAL: 0,
    DONE: 1,
    SPECIFIC_MOVE: 2,
    SPECIFIC_ATTACK: 3,
    LEAD_TO_GOAL:4
};

function init(r) {
    r.castleTalk(255);
    r.mode = MODE.LEAD_TO_GOAL;
    r.specific_action = 0;
    let robots = r.getVisibleRobots();
    for (let i = 0;i <  robots.length;i++) {
        if (robots[i].unit === SPECS.CASTLE) {
            r.parent_castle = robots[i];
            r.dir = [r.me.x - r.parent_castle.x,r.me.y - r.parent_castle.y];
            r.log("castle direction: " + r.dir);
            r.bullyPilgrims = false;
            let inc_signal = util.decodeCoords(r.parent_castle.signal);
            r.log("castle signal: " + inc_signal);
            if(inc_signal[2] === 4) {
                // r.log("killing pilgrims");
                // r.bullyPilgrims = true;
                r.goal = [inc_signal[0], inc_signal[1]];
                r.goal_map = util.pathfindingMap(r.map, [r.goal[0], r.goal[1]], util.getMoves(2), r);
            }


        }

    }
    for (let i = 0;i <  robots.length;i++) {

        if (robots[i].unit === SPECS.PROPHET) {
            let inc_signal = util.decodeCoords(robots[i].signal);
            //r.log("prophet signal: " + inc_signal);
            if (inc_signal[2] === 4 && r.goal[0] === inc_signal[0] && r.goal[1] === inc_signal[1]) {
                r.partnerID = robots[i].id;
                r.log("partner prophet found: " + robots[i].id);
            }

        }
    }
    //r.log("preacher signal: " + util.decodeCoords(util.signalCoords(r.goal[0],r.goal[1],4)));
    r.signal(util.signalCoords(r.goal[0],r.goal[1],4),8);
}







function defenseInit2(r) {
    let rmap = r.getVisibleRobotMap();

    let dir = [-r.dir[0],-r.dir[1]];
    r.log("defense move: " + dir);
    if (util.withInMap(dir[0],dir[1],r) && rmap[dir[0]][dir[1]] === 0 && r.map[dir[0]][dir[1]] === true)
        return r.move(dir[0],dir[1]);
    return util.fuzzy_move(r,r.dir[0],r.dir[1],2);

}

function defense_step(r) {
    let robotMap = r.getVisibleRobotMap();
    let attackRange = util.getMoves(4);
    for (let i = 0;i < attackRange.length;i++) {
        if (util.withInMap(r.me.y + attackRange[i][1],r.me.x + attackRange[i][0],r)) {
            let id = robotMap[r.me.y + attackRange[i][1]][r.me.x + attackRange[i][0]];
            if (id <= 0 || id === undefined) continue;

            let other_r = r.getRobot(id);

            if (r.me.team !== other_r.team) {
                return r.attack(attackRange[i][0], attackRange[i][1]);
            }
        }
    }
}

function killPilgrimStep(r) {
    if((r.me.x - r.goal[0]) ** 2 + (r.me.y - r.goal[1]) ** 2 <= 4) {
        let robotMap = r.getVisibleRobotMap();
        let attackRange = util.getMoves(4);
        for (let i = 0;i < attackRange.length;i++) {
            if (util.withInMap(r.me.y + attackRange[i][1],r.me.x + attackRange[i][0],r)) {
                let id = robotMap[r.me.y + attackRange[i][1]][r.me.x + attackRange[i][0]];
                if (id <= 0 || id === undefined) continue;

                let other_r = r.getRobot(id);

                if (r.me.team !== other_r.team) {
                    return r.attack(attackRange[i][0], attackRange[i][1]);
                }
            }
        }
    } else {
        let dx = r.goal_map[r.me.y][r.me.x][0];
        let dy = r.goal_map[r.me.y][r.me.x][1];

        let newX = r.me.x - dx;
        let newY = r.me.y - dy;

        if (r.getVisibleRobotMap()[newY][newX] === 0) {
            return r.move(-dx, -dy);
        }

        return util.fuzzy_move(r, -dx, -dy);
    }
}

function getPartnerAction(r) {

    let partner = r.getRobot(r.partnerID);
    if (partner === null) {
        return;
    }
    let distanceBtwnUs = (r.me.x - partner.x) ** 2 + (r.me.y - partner.y) ** 2;
    // let distanceBtwnUs = (r.me.x - partner.x) ** 2 + (r.me.y - partner.y) ** 2;
    // if (partner.signal === -1) return;
    // let partner_signal = util.decodeCoords(partner.signal);
    //
    // //r.log("partner " + partner.id + " move: " + partner_signal);
    // r.mode = partner_signal[2];
    // if (r.mode === MODE.SPECIFIC_MOVE || r.mode === MODE.SPECIFIC_ATTACK) {
    //     r.specific_action = [partner_signal[0],partner_signal[1]];
    //
    // }



}



function step(r) {
    if (r.fuel < 200) return;

    if (r.mode === MODE.LEAD_TO_GOAL) {

        //if cant find partner or partner to far, wait, else go to
        let partner = r.getRobot(r.partnerID);

        if (partner === null) return;
        let distanceBtwnUs = (r.me.x - partner.x) ** 2 + (r.me.y - partner.y) ** 2;
        if (distanceBtwnUs > 8) return;

        let dx = r.goal_map[r.me.y][r.me.x][0];
        let dy = r.goal_map[r.me.y][r.me.x][1];

        let newX = r.me.x - dx;
        let newY = r.me.y - dy;

        if (util.withInMap(newX, newY, r) && r.getVisibleRobotMap()[newY][newX] === 0) {
            r.log("preacher moving");
            return r.move(-dx, -dy);
        }

        let move = util.fuzzy_move(r, -dx, -dy, 3);
        if (move !== undefined) {
            r.log("preacher moving");
            return move;
        }
    }
    if (r.mode === MODE.DONE) {
            return;
        }

}

export function preacher_step(r) {
    if(r.step === 0) {
        init(r);
        //return defenseInit2(r);
    } else {
        getPartnerAction(r);
        return step(r);
    }



    // if(r.bullyPilgrims)
    //     return killPilgrimStep(r);
    // else
    //     return defense_step(r);
}