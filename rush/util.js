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

export function signalCoords(x, y) {
    return 64 * x + y;
}

export function decodeCoords(signal) {
    return [Math.floor(signal / 64), signal % 64];
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

export function getReflectedCoord(coord, r) {
    if (isHorizontallySymm(r)) {
        return [coord[0],r.map.length - 1 - coord[1]];
    } else {
        return [r.map.length - 1 - coord[0], coord[1]];
    }
}

export function rotateLeft(direction, amount, radius) {
    if(radius === 2) {
        if(direction[0] === 2)
            direction[0] = 1;
        if(direction[1] === 2)
            direction[1] = 1;
        if(direction[0] === -2)
            direction[0] = -1;
        if(direction[1] === -2)
            direction[1] = -1;

        let dir_coord = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
        let index = 0;
        while(dir_coord[index][0] != direction[0] || dir_coord[index][1] != direction[1])
            index++;

        return dir_coord[(index + amount) % 8];
    } else if(radius === 3) {
        //have fun
    }
}

export function rotateRight(direction, amount, radius) {
    if(radius === 2) {
        if(direction[0] === 2)
            direction[0] = 1;
        if(direction[1] === 2)
            direction[1] = 1;
        if(direction[0] === -2)
            direction[0] = -1;
        if(direction[1] === -2)
            direction[1] = -1;


        let dir_coord = [[0,-1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
        let index = 0;
        while(dir_coord[index][0] != direction[0] || dir_coord[index][1] != direction[1])
            index++;

        return dir_coord[(index + amount) % 8];
    } else if(radius === 3) {
        //have fun
    }
}

export function pathfindingMap(pass_map,start,moves, r) {
    let size = pass_map.length;
    let path_finding_map = create2dArray(size,size,0);

    //path_finding_map[start[1]][start[0]] = 1;
    let current_locations = [start];
    while (current_locations.length > 0) {
        //r.log(current_locations);
        let location = current_locations.shift();
        //r.log(location);
        for (let i = 0;i < moves.length;i++) {

            let next_location = [location[0] + moves[i][0], location[1] + moves[i][1]];
            if ( next_location[0] >= 0 && next_location[1] > 0 && next_location[0] < size && next_location[1] < size && path_finding_map[next_location[1]][next_location[0]] === 0 && pass_map[next_location[1]][next_location[0]] === true) {
                //r.log("reached");
                path_finding_map[next_location[1]][next_location[0]] = moves[i];
                //r.log("reached 2")
                current_locations.push(next_location);
            }
        }
    }
    return path_finding_map
}

export function karboniteCoords(pass_map, karbonite_map, start, moves, r) {
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

            if ( next_location[0] >= 0 && next_location[1] > 0 && next_location[0] < size && next_location[1] < size && path_finding_map[next_location[1]][next_location[0]] === 0 && pass_map[next_location[1]][next_location[0]] === true) {
                path_finding_map[next_location[1]][next_location[0]] = 1;
                queue.push(next_location);
            }
        }
    }

    return coords;
}

export function pathTo(pass_map, start, end, moves, r) {
    let size = pass_map.length;

    let queue = [start];
    let path_finding_map = create2dArray(size, size, 0)

    while(queue.length > 0) {
        let location = queue.shift();

        if(location[0] === end[0] && location[1] === end[1])
           break;

        for (let i = 0;i < moves.length;i++) {
            let next_location = [location[0] + moves[i][0], location[1] + moves[i][1]];

            if ( next_location[0] >= 0 && next_location[1] >= 0 && next_location[0] < size && next_location[1] < size && path_finding_map[next_location[1]][next_location[0]] === 0 && pass_map[next_location[1]][next_location[0]] === true) {
                path_finding_map[next_location[1]][next_location[0]] = moves[i];
                queue.push(next_location);
            }
        }
    }

    let path = [];
    let location = end;

    while(location[0] !== start[0] || location[1] !== start[1]) {
        let move = path_finding_map[location[1]][location[0]];
        path.unshift(move);

        location[0] -= move[0];
        location[1] -= move[1];
    }

    return path;
}

export function directionTo(x, y, goal_x, goal_y) {
    let dx = goal_x - x;
    let dy =  y - goal_y;

    if (dy == 0) {
        if (dx > 0) return directions('East');
        else return directions('West');

    }
    if (dx == 0) {
        if (dy > 0) directions('North');
        else return directions('South');
    }
    let angle = (0.0 + dy) / dx;

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

        if (dx > 0)return directions('NorthEast');
        else return directions('SouthWest');
    }
}

export function BFSToLocationInRadius(pass_map, start, end,radius, moves, r) {
    let size = pass_map.length;

    let queue = [start];
    let path_finding_map = create2dArray(size, size, 0)

    while(queue.length > 0) {
        let location = queue.shift();
        r.log("loc: " + location[0] + " " + location[1]);

        if((location[0] - end[0]) ** 2 + (location[1] - end[1]) ** 2 <= radius ** 2 )
            return location;

        for (let i = 0;i < moves.length;i++) {
            let next_location = [location[0] + moves[i][0], location[1] + moves[i][1]];

            if ( next_location[0] >= 0 && next_location[1] >= 0 && next_location[0] < size && next_location[1] < size && path_finding_map[next_location[1]][next_location[0]] === 0 && pass_map[next_location[1]][next_location[0]] === true) {
                path_finding_map[next_location[1]][next_location[0]] = moves[i];
                queue.push(next_location);
            }
        }
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
            if ( next_location[0] >= 0 && next_location[1] > 0 && next_location[0] < size && next_location[1] < size && path_finding_map[next_location[1]][next_location[0]] === 0 && pass_map[next_location[1]][next_location[0]] === true) {
                //r.log("reached");
                path_finding_map[next_location[1]][next_location[0]] = moves[i];
                //r.log("reached 2")
                current_locations.push(next_location);
            }
        }
    }
    return path_finding_map
}