import {SPECS} from 'battlecode';

export function getMoves(r) {
    let moves = [];
    for(let i=-r;i<=r;i++) {
        for(let j=-r;j<=r;j++) {
            if(i === 0 && j === 0) continue;

            if(i ** 2 + j ** 2 <= r ** 2) {
                moves.push({x:i,y:j});
            }
        }
    }
    return moves;
}

export function create2dArray(rows, cols, fill) {
    let arr = [];

    for(let i=0;i<rows;i++) {
        let row = [];
        for(let j=0;j<cols;j++) {
            row[j] = fill;
        }
        arr[i] = row;
    }

    return arr;
}
export function BFSMap(pass_map,start,moves) {
    let size = pass_map.length;
    let path_finding_map = create2dArray(size,size,0);

    path_finding_map[start.y][start.x] = 9999999999;
    let current_locations = [start];
    while (current_locations.length > 0) {
        //r.log(current_locations);
        let location = current_locations.shift();
        for (let i = 0;i < moves.length;i++) {

            let next_location = {x: location.x + moves[i].x, y: location.y + moves[i].y};
            if ( next_location.x >= 0 && next_location.y >= 0 && next_location.x < size && next_location.y < size && path_finding_map[next_location.y][next_location.x] === 0 && pass_map[next_location.y][next_location.x] === true) {
                //r.log("reached");
                path_finding_map[next_location.y][next_location.x] = moves[i];
                //r.log("reached 2")
                current_locations.push(next_location);
            }
        }
    }
    return path_finding_map
}




export function resourceCoords(pass_map, resource_map, start, moves, r) {
    let size = pass_map.length;
    let queue = [start];
    let path_finding_map = create2dArray(size, size, 0)
    let coords = [];

    while(queue.length > 0) {
        let location = queue.shift();

        if(resource_map[location.y][location.x]) {
            coords.push(location);
        }

        for (let i = 0;i < moves.length;i++) {
            let next_location = {x: location.x + moves[i].x, y: location.y + moves[i].y};

            if ( next_location.x >= 0 && next_location.y >= 0 && next_location.x < size && next_location.y < size && path_finding_map[next_location.y][next_location.x] === 0 && pass_map[next_location.y][next_location.x] > 0) {
                path_finding_map[next_location.y][next_location.x] = 1;
                queue.push(next_location);
            }
        }
    }

    return coords;
}

export function signalCoords(x, y, code) {
    return (code << 12) + (y << 6) + x;
}

export function decodeCoords(signal) {
    return {x: signal % 64, y: (signal >> 6) % 64, code: signal >> 12};
}

export function isHorizontallySymm(r) {

    let size = r.map.length;
    for (let y = 0;y < size;y++) {
        for (let x = 0;x < size;x++) {
            if (r.map[y][x] !== r.map[y][size - 1 - x]) {
                return true;
            }
        }
    }
    return false;

}

export function getReflectedCoord(coord,r) {

    if (r.HSymm) {
        return [coord[0],r.map.length - 1 - coord[1]];
    } else {
        return [r.map.length - 1 - coord[0],coord[1]];
    }
}
export function directions(dir) {
    let dir_coord = [{x:0,y:-1}, {x:1,y:-1}, {x:1,y:0}, {x:1,y:1}, {x:0,y:1}, {x:-1,y:1}, {x:-1,y:0}, {x:-1,y:-1}];
    if (typeof dir === 'string') {
        let dir_name = ['North', 'NorthEast', 'East', 'SouthEast', 'South', 'SouthWest', 'West', 'NorthWest'];
        return dir_coord[dir_name.indexOf(dir)];
    }
    return dir_coord[dir]


}

export function directionTo(dx,dy) {
    dy = -dy;
    if (dy === 0) {
        if (dx > 0) return directions('East');
        else return directions('West');

    }
    if (dx === 0) {
        if (dy > 0) return directions('North');
        else return directions('South');
    }
    let angle = dy / dx;

    if  (angle < -2.41) {
        if (dy > 0) return directions('North');
        else return directions('South');
    }
    if (angle < -0.414) {

        if (dy > 0) return directions('NorthWest');
        else return directions('SouthEast');
    }
    if  (angle < 0.414) {
        if (dx > 0) return directions('East');
        else return directions('West');
    }
    if (angle <= 2.41) {

        if (dx > 0) return directions('NorthEast');
        else return directions('SouthWest');

    }
    if (angle > 2.41) {
        if (dx > 0) return directions('North');
        else return directions('South');
    }
    if (angle > 2.41) {
        if (dx > 0) return directions('North');
        else return directions('South');
    }
}

export function rotateLeft(direction, amount) {
    let dir_coord = [{x:-1,y:-1}, {x:-1,y:0}, {x:-1,y:1}, {x:0,y:1}, {x:1,y:1}, {x:1,y:0}, {x:1,y:-1}, {x:0,y:-1}];
    let index = 0;
    while(dir_coord[index].x !== direction.x || dir_coord[index].y !== direction.y)
        index++;

    return dir_coord[(index + amount) % 8];
}

export function rotateRight(direction, amount) {
    let dir_coord = [{x:0,y:-1}, {x:1,y:-1}, {x:1,y:0}, {x:1,y:1}, {x:0,y:1}, {x:-1,y:1}, {x:-1,y:0}, {x:-1,y:-1}];
    let index = 0;
    while(dir_coord[index].x !== direction.x || dir_coord[index].y !== direction.y)
        index++;

    return dir_coord[(index + amount) % 8];
}

export function findParentCastle(r) {
    let visible = r.getVisibleRobots();
    for(let i=0;i<visible.length;i++) {
        if(visible[i].unit === SPECS.CASTLE && (visible[i].x - r.me.x) ** 2 + (visible[i].y - r.me.y) ** 2 <= 2)
            return visible[i];
    }
}

//tolerance 0 = 0~30 degrees, 1 =  90~120 degrees, 2 = 180~210 degrees
export function getFuzzyMoves(r,dx,dy,radius,tolerance) {
    
    let possibleMoves = getMoves(radius);
    let dir = [directionTo(dx, dy, r)];
    r.log("main dir: " + dir[0]);
    if (tolerance >= 1) {
        dir.push(rotateRight(dir[0], 1));
        dir.push(rotateLeft(dir[0], 1));
    }
    if (tolerance >= 2) {
        dir.push(rotateRight(dir[0],2));
        dir.push(rotateLeft(dir[0],2));
    }
    let moves = [];
    for (let i = 0;i < possibleMoves.length;i++) {
        let currentDir = directionTo(possibleMoves[i][0],possibleMoves[i][1],r);
        r.log(possibleMoves[i] + ": " + currentDir);
        for (let j = 0;j < dir.length;j++) {
            if (currentDir.x === dir[j].x && currentDir.y === dir[j].x)
                moves.push(possibleMoves[i]);
        }
    }
    //r.log(moves);
    return moves;
}