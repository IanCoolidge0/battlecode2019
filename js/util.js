import {SPECS} from 'battlecode';



export function getMoves(r) {
    let moves = []
    for(let i=-r;i<=r;i++) {
        for(let j=-r;j<=r;j++) {
            if(i == 0 && j == 0) continue;

            if(i ** 2 + j ** 2 <= r ** 2) {
                moves.push([i, j]);
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
export function BFSMap(pass_map,start,moves,r) {
    let size = pass_map.length;
    let path_finding_map = create2dArray(size,size,0);

    path_finding_map[start[1]][start[0]] = 9999999999;
    let current_locations = [start];
    while (current_locations.length > 0) {
        //r.log(current_locations);
        let location = current_locations.shift();
        for (let i = 0;i < moves.length;i++) {

            let next_location = [location[0] + moves[i][0], location[1] + moves[i][1]];
            if ( next_location[0] >= 0 && next_location[1] >= 0 && next_location[0] < size && next_location[1] < size && path_finding_map[next_location[1]][next_location[0]] === 0 && pass_map[next_location[1]][next_location[0]] === true) {
                //r.log("reached");
                path_finding_map[next_location[1]][next_location[0]] = moves[i];
                //r.log("reached 2")
                current_locations.push(next_location);
            }
        }

    }
    return path_finding_map
}

export function dijkstraMap(influenceMap,start,moves,r) {
    let pathFindingMap = create2dArray(r.size,r.size,0);
    let paths = [start];

    while (paths.length > 0) {
        let shortest_path = paths[0];
        let shortest_path_index = 0;
        for (let i = 1;i < paths.length;i++) {
            let path = paths[i];
            if (influenceMap[shortest_path.y][shortest_path.x] > influenceMap[path.y][path.x]) {
                shortest_path = path;
                shortest_path_index = i;
            }
        }
        paths.splice(shortest_path_index,1);
        pathFindingMap[shortest_path.y][shortest_path.x] = influenceMap[shortest_path.y][shortest_path.x];
        for (let i = 0;i < moves.length;i++) {
            let next = {x:shortest_path.x + moves[i].x, y: shortest_path.y + moves[i].y};

            if (pathFindingMap[next.y][next.x] === 0 && influenceMap[next.y][next.x] !== -1) {
                paths.push(next);
            }
        }
    }
    r.log(pathFindingMap);


}


export function resourceCoords(pass_map, karbonite_map, start, moves, r) {
    let size = pass_map.length;
    let queue = [start];
    let path_finding_map = create2dArray(size, size, 0)
    let coords = [];

    while(queue.length > 0) {
        let location = queue.shift();

        if(karbonite_map[location[1]][location[0]]) {
            coords.push(location);
        }

        for (let i = 0;i < moves.length;i++) {
            let next_location = [location[0] + moves[i][0], location[1] + moves[i][1]];

            if ( next_location[0] >= 0 && next_location[1] >= 0 && next_location[0] < size && next_location[1] < size && path_finding_map[next_location[1]][next_location[0]] === 0 && pass_map[next_location[1]][next_location[0]] === true) {
                path_finding_map[next_location[1]][next_location[0]] = 1;
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
    return [signal % 64, (signal >> 6) % 64, signal >> 12];
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
    let dir_coord = [[0,-1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
    if (typeof dir === 'string') {
        let dir_name = ['North', 'NorthEast', 'East', 'SouthEast', 'South', 'SouthWest', 'West', 'NorthWest'];
        return dir_coord[dir_name.indexOf(dir)];
    }
    return dir_coord[dir]


}

export function directionTo(dx,dy, r) {
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
    let dir_coord = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
    let index = 0;
    while(dir_coord[index][0] != direction[0] || dir_coord[index][1] != direction[1])
        index++;

    return dir_coord[(index + amount) % 8];
}

export function rotateRight(direction, amount) {
    let dir_coord = [[0,-1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
    let index = 0;
    while(dir_coord[index][0] != direction[0] || dir_coord[index][1] != direction[1])
        index++;

    return dir_coord[(index + amount) % 8];
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
            if (currentDir[0] === dir[j][0] && currentDir[1] === dir[j][1])
                moves.push(possibleMoves[i]);
        }
    }
    return moves;
}

