import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from "battlecode";

export function getWallLocations(r) {
    let hsymm = util.isHorizontallySymm(r); //true if ys are the same
    let locs = [];

    if(hsymm) {
        let i = 0;
        while(i < r.map.length) {
            i += constants.WALL_FANOUT;
            locs.push({x: i, y: (r.me.y >= r.map.length / 2) ? 0 : r.map.length - 1});
        }
    } else {
        let j = 0;
        while(j < r.map.length) {
            j += constants.WALL_FANOUT;
            locs.push({x: (r.me.x >= r.map.length / 2) ? 0 : r.map.length - 1, y: j});
        }
    }

    return locs;
}

export function getWallLocation2(r) {
    if(util.isHorizontallySymm(r)) {
        return {x: Math.floor(r.map.length / 2), y: (r.me.y >= r.map.length / 2) ? 0 : r.map.length - 1};
    } else {
        return {x: (r.me.x >= r.map.length / 2) ? 0 : r.map.length - 1, y: Math.floor(r.map.length / 2)};
    }
}

export function freeOffensiveChurch(r) {
    let behind;
    let possible;

    if(util.isHorizontallySymm(r)) {
        behind = (r.me.y > r.starting_pos.y) ? {x: 0, y: -1} : {x: 0, y: 1};
    } else {
        behind = (r.me.x > r.starting_pos.x) ? {x: -1, y: 0} : {x: 1, y: 0};
    }

    if(behind.x === 0) {
        possible = [{x: -1, y: behind.y}, {x: 0, y: behind.y}, {x: 1, y: behind.y}];
    } else {
        possible = [{x: behind.x, y: -1}, {x: behind.x, y: 0}, {x: behind.x, y: 1}];
    }

    for(let i=0;i<possible.length;i++) {
        let next = {x: r.me.x + possible[i].x, y: r.me.y + possible[i].y};

        if(util.withInMap(next, r) && r.map[next.y][next.x] && r.getVisibleRobotMap()[next.y][next.x] === 0)
            return next;
    }
}

export function backward(r, scout_pos) {
    if(util.isHorizontallySymm(r)) {
        return (r.me.y > scout_pos.y) ? {x: 0, y: 1} : {x: 0, y: -1};
    } else {
        return (r.me.x > scout_pos.x) ? {x: 1, y: 0} : {x: -1, y: 0};
    }
}

export function pilgrim_backward(r, scout_pos) {
    if(util.isHorizontallySymm(r)) {
        return (r.me.y > scout_pos.y) ? {x: 0, y: -1} : {x: 0, y: 1};
    } else {
        return (r.me.x > scout_pos.x) ? {x: -1, y: 0} : {x: 1, y: 0};
    }
}

export function scoutDestination(r, goal_pos) {
    if(util.isHorizontallySymm(r)) {
        if(goal_pos.x === constants.WALL_FANOUT) //times 1
            return {x: 0, y: goal_pos.y};
    } else {
        if(goal_pos.y === constants.WALL_FANOUT)
            return {x: goal_pos.x, y: 0};
    }
}

export function scoutDestinationUp(r, goal_pos) {
    let hsymm = util.isHorizontallySymm(r);

    if(hsymm && goal_pos.y === 0) {
        for(let x=0;x<r.map.length;x++) {
            for(let y=0;y<r.map.length;y++) {
                if(r.map[y][x])
                    return {x: x, y: y};
            }
        }
    } else if(hsymm && goal_pos.y !== 0) {
        for(let x=0;x<r.map.length;x++) {
            for(let y=r.map.length-1;y>=0;y--) {
                if(r.map[y][x])
                    return {x: x, y: y};
            }
        }
    } else if(!hsymm && goal_pos.y === 0) {
        for(let y=0;y<r.map.length;y++) {
            for(let x=0;x<r.map.length;x++) {
                if(r.map[y][x])
                    return {x: x, y: y};
            }
        }
    } else if(!hsymm && goal_pos.y !== 0) {
        for(let y=0;y<r.map.length;y++) {
            for(let x=r.map.length-1;x>=0;x--) {
                if(r.map[y][x])
                    return {x: x, y: y};
            }
        }
    }
}

export function scoutDestinationDown(r, goal_pos) {
    let hsymm = util.isHorizontallySymm(r);

    if(hsymm && goal_pos.y === 0) {
        for(let x=r.map.length-1;x>=0;x--) {
            for(let y=0;y<r.map.length;y++) {
                if(r.map[y][x])
                    return {x: x, y: y};
            }
        }
    } else if(hsymm && goal_pos.y !== 0) {
        for(let x=r.map.length-1;x>=0;x--) {
            for(let y=r.map.length-1;y>=0;y--) {
                if(r.map[y][x])
                    return {x: x, y: y};
            }
        }
    } else if(!hsymm && goal_pos.y === 0) {
        for(let y=r.map.length-1;y>=0;y--) {
            for(let x=0;x<r.map.length;x++) {
                if(r.map[y][x])
                    return {x: x, y: y};
            }
        }
    } else if(!hsymm && goal_pos.y !== 0) {
        for(let y=r.map.length-1;y>=0;y--) {
            for(let x=r.map.length-1;x>=0;x--) {
                if(r.map[y][x])
                    return {x: x, y: y};
            }
        }
    }
}

export function inAttackRange(x, y, robot) {
    if(robot.unit === SPECS.CRUSADER)
        return (x - robot.x) ** 2 + (y - robot.y) ** 2 <= 16;
    if(robot.unit === SPECS.PROPHET)
        return (x - robot.x) ** 2 + (y - robot.y) ** 2 <= 64;
    if(robot.unit === SPECS.PREACHER)
        return (x - robot.x) ** 2 + (y - robot.y) ** 2 <= 25;
    if(robot.unit === SPECS.CASTLE)
        return (x - robot.x) ** 2 + (y - robot.y) ** 2 <= 64;

    return false;
}

export function safetyMap(r) {
    let map = util.create2dArray(r.map.length, r.map.length, false);

    let visible = r.getVisibleRobots();

    for(let i=0;i<r.map.length;i++) {
        for(let j=0;j<r.map.length;j++) {
            if(r.map[j][i])
                map[j][i] = true;

            for(let k=0;k<visible.length;k++) {
                if(inAttackRange(i, j, visible[k]) && r.me.team !== visible[k].team)
                    map[j][i] = false;
            }
        }
    }

    return map;
}

export function wallLocationSubsequent(r, goal_pos) {
    if(util.isHorizontallySymm(r)) {
        let gy = (r.me.y >= r.map.length / 2) ? 0 : r.map.length - 1;
        return {x: goal_pos.x + constants.WALL_FANOUT, y: gy};
    } else {
        let gx = (r.me.x >= r.map.length / 2) ? 0 : r.map.length - 1;
        return {x: gx, y: goal_pos.y + constants.WALL_FANOUT};
    }
}

export function finishedBuilding(r, lastChurchPos) {
    if(util.isHorizontallySymm(r)) {
        return lastChurchPos.x >= r.map.length - constants.WALL_FANOUT;
    } else {
        return lastChurchPos.y >= r.map.length - constants.WALL_FANOUT;
    }
}

export function checkCompletePositions(r, lastPos, back) {
    let next1 = {x: lastPos.x + back.x, y: lastPos.y + back.y};

    let next2;
    if(back.x === 0)
        next2 = {x: lastPos.x - 1, y: lastPos.y + 2 * back.y};
    else
        next2 = {x: lastPos.x + 2 * back.x, y: lastPos.y - 1};

    let next3 = {x: lastPos.x + 3 * back.x, y: lastPos.y + 3 * back.y};

    //r.log('checking');
    //r.log(next2);

    let map = r.getVisibleRobotMap();
    return (map[next1.y][next1.x] > 0 || !r.map[next1.y][next1.x])
        && (map[next2.y][next2.x] > 0 || !r.map[next2.y][next2.x])
        && (map[next3.y][next3.x] > 0 || !r.map[next3.y][next3.x]);
}

export function addSeenUnits(r, seenUnits) {
    let visible = r.getVisibleRobots();

    for(let k=0;k<visible.length;k++) {
        if(visible[k].team !== r.me.team) {
            if(visible[k].unit === SPECS.CRUSADER) {
                for(let i=-4;i<=4;i++) {
                    for(let j=-4;j<=4;j++) {
                        if(i ** 2 + j ** 2 <= 16)
                            seenUnits[visible[k].y + j][visible[k].x + i] = false;
                    }
                }
            }

            if(visible[k].unit === SPECS.PREACHER) {
                for(let i=-5;i<=5;i++) {
                    for(let j=-5;j<=5;j++) {
                        if(i ** 2 + j ** 2 <= 25)
                            seenUnits[visible[k].y + j][visible[k].x + i] = false;
                    }
                }
            }

            if(visible[k].unit === SPECS.PROPHET) {
                for(let i=-8;i<=8;i++) {
                    for(let j=-8;j<=8;j++) {
                        if(i ** 2 + j ** 2 <= 64)
                            seenUnits[visible[k].y + j][visible[k].x + i] = false;
                    }
                }
            }
        }
    }
}

export function testLine(r, churchPos, seenUnitMap) {
    let line = util.coordsOnLine(r, r.me.x, r.me.y, churchPos.x, churchPos.y)

    for(let i=0;i<line.length;i++) {
        if(!seenUnitMap[line[i].y][line[i].x])
            return true;
    }

    return false;
}