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

// export function karboniteCoords(passMap, karbMap, startX, startY, moves, r) {
//     let size = passMap.length;
//
//     let visited = create2dArray(size, size, false);
//     let queue = [[startX, startY]];
//     let coords = [];
//
//     while(queue.length > 0) {
//         let current_pos = queue.shift();
//
//         if (karbMap[current_pos[1]][current_pos[0]]) {
//             coords.push(current_pos);
//         }
//
//         for (let i = 0; i < moves.length; i++) {
//             let move = moves[i];
//
//             let nextX = current_pos[0] + move[0];
//             let nextY = current_pos[1] + move[1];
//
//             if (Math.min(nextX, nextY) < 0 || Math.max(nextX, nextY) >= size)
//                 continue;
//
//             if (visited[nextY][nextX] || !passMap[nextY][nextX])
//                 continue;
//
//             if (!queue.includes([nextX, nextY])) {
//                 queue.push([nextX, nextY]);
//             }
//         }
//
//         visited[current_pos[1]][current_pos[0]] = true;
//
//     }
//
//     return coords;
// }

export function directions(dir) {
    let dir_name = ['North', 'NorthEast', 'East', 'SouthEast', 'South', 'SouthWest', 'West', 'NorthWest'];
    let dir_coord = [[0,-1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
    return dir_coord[dir_name.indexOf(dir)];
}

export function pathfindingMap(pass_map,start,moves) {
    let size = pass_map.length;
    let path_finding_map = create2dArray(size,size,0);

    //path_finding_map[start[1]][start[0]] = 1;
    let current_locations = [start];
    while (current_locations.length > 0) {
        //r.log(current_locations);
        let location = current_locations.pop();
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

export function karboniteCoords(pass_map, karbonite_map, start, moves) {
    let size = pass_map.length;
    let queue = [start];
    let path_finding_map = create2dArray(size, size, 0)
    let coords = [];

    while(queue.length > 0) {
        let location = queue.pop();

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
        let location = queue.pop();

        if(location[0] === end[0] && location[1] === end[1])
            break;

        for (let i = 0;i < moves.length;i++) {
            let next_location = [location[0] + moves[i][0], location[1] + moves[i][1]];

            if ( next_location[0] >= 0 && next_location[1] > 0 && next_location[0] < size && next_location[1] < size && path_finding_map[next_location[1]][next_location[0]] === 0 && pass_map[next_location[1]][next_location[0]] === true) {
                path_finding_map[next_location[1]][next_location[0]] = moves[i];
                queue.push(next_location);
            }
        }
    }

    let path = [];
    let location = end;

    while(location[0] !== start[0] || location[1] !== start[1]) {
        let move = path_finding_map[location[1]][location[0]];
        path.push(move);

        location[0] -= move[0];
        location[1] -= move[1];
    }

    return path;
}