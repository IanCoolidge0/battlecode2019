import * as util from "./util.js";
import {SPECS} from 'battlecode';
var MODE = {
    PATH_TO_GOAL: 0,
    WAIT: 1,
    SPECIFIC_MOVE: 2,
    SPECIFIC_ATTACK: 3,
};



function init(r) {
    r.partnerMode = MODE.PATH_TO_GOAL;
    let robots = r.getVisibleRobots();
    for (let i = 0;i <  robots.length;i++) {
        if (robots[i].unit === SPECS.CASTLE) {
            r.parent_castle = robots[i];
            r.dir = [r.me.x - r.parent_castle.x,r.me.y - r.parent_castle.y];
            r.log("castle direction: " + r.dir);
            r.bullyPilgrims = false;
            let inc_signal = util.decodeCoords(r.parent_castle.signal);
            if (inc_signal[2] === 4) {
                r.partnerID = 0;
                r.goal = [inc_signal[0], inc_signal[1]];
                r.goal_map = util.pathfindingMap(r.map, [r.goal[0], r.goal[1]], util.getMoves(2), r);
                let dir = [-r.dir[0],-r.dir[1]];
                r.signal(util.signalCoords(r.goal[0],r.goal[1],4),8);
                r.log("prophet signal: " + util.decodeCoords(util.signalCoords(r.goal[0],r.goal[1],4)));
                // if (util.withInMap(dir[0],dir[1],r) && rmap[dir[0]][dir[1]] === 0 && r.map[dir[0]][dir[1]] === true)
                //     return r.move(dir[0],dir[1]);
                // return util.fuzzy_move(r,r.dir[0],r.dir[1],4);
            }

        }
    }

}

function waitForPartner(r) {
    let robots = r.getVisibleRobots();
    for (let i = 0;i <  robots.length;i++) {

        if (robots[i].unit === SPECS.PREACHER) {
            let inc_signal = util.decodeCoords(robots[i].signal);
            //r.log("prophet signal: " + inc_signal);
            if (inc_signal[2] === 4 && r.goal[0] === inc_signal[0] && r.goal[1] === inc_signal[1]) {
                r.partnerID = robots[i].id;
                r.log("partner preacher found: " + robots[i].id);
            }

        }
    }
    //r.log("prophet signal: " + util.decodeCoords(util.signalCoords(r.goal[0],r.goal[1],4)));
    r.signal(util.signalCoords(r.goal[0],r.goal[1],4),8);

}

function givePartnerAction(r) {
    r.ownAction = 0;
    let partner = r.getRobot(r.partnerID);
    if (partner === null) {
        return;
    }
    let distanceBtwnUs = (r.me.x - partner.x) ** 2 + (r.me.y - partner.y) ** 2;
    if (distanceBtwnUs > 32) {
        r.partnerMode = MODE.WAIT;
        r.signal(util.signalCoords(0,0,MODE.WAIT),distanceBtwnUs);
    } else if (r.partnerMode !== MODE.PATH_TO_GOAL && distanceBtwnUs < 16) {
        r.partnerMode = MODE.PATH_TO_GOAL;

        r.signal(util.signalCoords(0,0,MODE.PATH_TO_GOAL),distanceBtwnUs);
}



}
function step(r) {

    let partner = r.getRobot(r.partnerID);
    if (r.ownAction === 1) {
        let robotMap = r.getVisibleRobotMap();
        let dir = util.directionTo(r.me.x,r.me.y,partner.x,partner.y,r);
        let newX = r.me.x + dir[0];
        let newY = r.me.y + dir[1];
        if (util.withInMap(newX,newY,r) && r.map[newY][newX] && robotMap[newY][newX] == 0) {
            r.log("move to target");
            return r.move(dir[0], dir[1]);
        }
        else {
            let dx = r.goal_map[r.me.y][r.me.x][0];
            let dy = r.goal_map[r.me.y][r.me.x][1];

            let newX = r.me.x - dx;
            let newY = r.me.y - dy;
            if (r.getVisibleRobotMap()[newY][newX] === 0) {
                r.log("preacher moving");
                return r.move(-dx, -dy);
            }
            return util.fuzzy_move(r, dir[0], dir[1],2);
        }
    }


}

export function prophet_step(r) {
    if (r.step === 0) {
        return init(r);
    } else if (r.partnerID === 0) {
        //r.log("waiting");
        waitForPartner(r);
    } else {
        givePartnerAction(r);
        return step(r);
    }
}

