import * as util from "./util.js";
import {SPECS} from 'battlecode';
var MODE = {
    PATH_TO_GOAL: 0,
    WAIT: 1,
    SPECIFIC_MOVE: 2,
    SPECIFIC_ATTACK: 3,
    FOLLOW_TO_GOAL:4,
};



function init(r) {
    r.castleTalk(255);
    r.Mode = MODE.FOLLOW_TO_GOAL;
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
    let distanceGoalToMe = (r.me.x - r.goal[0]) ** 2 + (r.me.y - r.goal[1]) ** 2;

}

function micro(r) {
    let map = r.map()
}


function step(r) {
    if (r.fuel < 200) return;

    for
    if (r.Mode == MODE.FOLLOW_TO_GOAL) {
        let partner = r.getRobot(r.partnerID);
        if (partner === null) return;
        let robotMap = r.getVisibleRobotMap();
        let dir = util.directionTo(r.me.x,r.me.y,partner.x,partner.y,r);
        let newX = r.me.x + dir[0];
        let newY = r.me.y + dir[1];
        if (newX === partner.x && newY === partner.y) return;
        if (util.withInMap(newX,newY,r) && r.map[newY][newX] && robotMap[newY][newX] == 0) {
            r.log("move to target");
            return r.move(dir[0], dir[1]);
        }
        return util.fuzzy_move(r, dir[0], dir[1],3);


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

