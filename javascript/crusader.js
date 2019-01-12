import {BCAbstractRobot, SPECS} from 'battlecode';
import * as util from "./util.js";

export function crusaderInit(r) {
    r.HSymm = util.isHorizontallySymm(r);
    r.castleCoord = getCastle(r);
    r.ECastleCoord = util.getReflectedCoord(r.castleCoord,r);
    r.log(r.castleCoord + "   " + r.ECastleCoord);

}

export function crusader_step(r){


}

function getCastle(r) {
    let robotMap = r.getVisibleRobotMap();
    for (let i = 0;i < 8;i++) {
        let dir = util.directions(i);
        if (robotMap[r.me.y + dir[1]][r.me.x + dir[0]] > 0 && r.getRobot(robotMap[r.me.y + dir[1]][r.me.x + dir[0]]).unit === SPECS.CASTLE) {
            return [r.me.x + dir[0], r.me.y + dir[1]];

        }
    }
    r.log(robotMap);
}
