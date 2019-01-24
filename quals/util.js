


import {SPECS} from 'battlecode';
import * as constants from "./constants.js";

// export function dijkstraMap(influenceMap,start,moves,r) {
//     //r.log(start);
//
//
//     let directionMap = create2dArray(r.size,r.size,0);
//     let distanceMap = create2dArray(r.size,r.size,-1);
//     distanceMap[start.y][start.x] = 1;
//     let currentLocations = [start];
//     let visitedMap = create2dArray(r.size,r.size,false);
//     visitedMap[start.y][start.x] = true;
//
//
//
//     while (currentLocations.length > 0) {
//         let bestDistance = 99999999;
//         let bestLocIndex =  -1;
//         let bestMoveIndex = -1;
//         for (let i = 0;i < currentLocations.length;i++) {
//             let distance = distanceMap[currentLocations[i].y][currentLocations[i].y];
//             for (let j = 0;j < moves.length;j++) {
//                 const next = {x:currentLocations[i].x + moves[j].x, y:currentLocations[i].y + moves[j].y};
//
//                 if (!withInMap(next,r) || influenceMap[next.y][next.x] === -1 || directionMap[next.y][next.x] != 0) continue;
//                 if (bestDistance > distance + influenceMap[next.y][next.x]) {
//                     bestDistance = distance + influenceMap[next.y][next.x];
//                     bestLocIndex = i;
//                     bestMoveIndex = j;
//
//                 }
//
//             }
//         }
//         const bestLoc = {x:currentLocations[i].x + moves[j].x, y:currentLocations[i].y + moves[j].y};
//         visitedMap[bestLoc.y][bestLoc.x] = true;
//
//         distanceMap[bestLoc.y][bestLoc.x] = moves[j];
//         currentLocations.push(bestLoc);
//
//
//
//         //r.log('reached' + shortest_path.x + ", " + shortest_path.y);
//         paths.splice(shortest_path_index,1);
//         pathFindingMap[shortest_path.y][shortest_path.x] = influenceMap[shortest_path.y][shortest_path.x];
//
//         //r.log(paths.length);
//
//     }
//     r.log("map : \n" + pathFindingMap);
//
//
// }
export function BFSMap_with_rmap(pass_map, start, moves, r) {
    let rmap = r.getVisibleRobotMap();
    rmap[r.me.y][r.me.x] = 0;
    rmap[start.y][start.x] = 0;

    let size = pass_map.length;
    let path_finding_map = create2dArray(size,size,0);

    path_finding_map[start.y][start.x] = 9999999999;
    let current_locations = [start];
    while (current_locations.length > 0) {
        //r.log(current_locations);
        let location = current_locations.shift();
        for (let i = 0;i < moves.length;i++) {

            let next_location = {x: location.x + moves[i].x, y: location.y + moves[i].y};
            if ( next_location.x >= 0 && next_location.y >= 0 && next_location.x < size && next_location.y < size
                && path_finding_map[next_location.y][next_location.x] === 0 && pass_map[next_location.y][next_location.x] === true && rmap[next_location.y][next_location.x] <= 0) {
                //r.log("reached");
                path_finding_map[next_location.y][next_location.x] = moves[i];
                //r.log("reached 2")
                current_locations.push(next_location);
            }
        }
    }
    //r.log(path_finding_map);
    return path_finding_map
}


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

export function getMoves2(r_squared) {
    let r = Math.floor(Math.sqrt(r_squared));
    let moves = [];
    for(let i=-r;i<=r;i++) {
        for(let j=-r;j<=r;j++) {
            if(i === 0 && j === 0) continue;

            if(i ** 2 + j ** 2 <= r_squared) {
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

    path_finding_map[start.y][start.x] = 99;
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
    let path_finding_map = create2dArray(size, size, 0);
    let coords = [];

    let hsymm = isHorizontallySymm(r);
    let side = hsymm ? r.me.y > r.map.length / 2 : r.me.x > r.map.length / 2;

    while(queue.length > 0) {
        let location = queue.shift();

        if(resource_map[location.y][location.x]) {
            coords.push(location);
        }

        for (let i = 0;i < moves.length;i++) {
            let next_location = {x: location.x + moves[i].x, y: location.y + moves[i].y};
            let next_side = hsymm ? next_location.y > r.map.length / 2 : next_location.x > r.map.length / 2;

            if ( next_location.x >= 0 && next_location.y >= 0 && next_location.x < size && next_location.y < size && path_finding_map[next_location.y][next_location.x] === 0 && pass_map[next_location.y][next_location.x] > 0 && next_side === side) {
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


    if (isHorizontallySymm(r)) {
        return {x:coord.x, y:r.map.length - 1 - coord.y};
    } else {
        return {x:r.map.length - 1 - coord.x, y:coord.y};
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

export function similar(dir1, dir2) {
    let dir_coord = [{x:-1,y:-1}, {x:-1,y:0}, {x:-1,y:1}, {x:0,y:1}, {x:1,y:1}, {x:1,y:0}, {x:1,y:-1}, {x:0,y:-1}];

    let i = 0;
    while(dir_coord[i].x !== dir1.x || dir_coord[i].y !== dir1.y)
        i++;

    let j = 0;
    while(dir_coord[j].x !== dir2.x || dir_coord[j].y !== dir2.y)
        j++;

    return Math.abs(i - j) < 2;
}

export function similar_with_tolerance(dir1, dir2,tolerance) {
    let dir_coord = [{x:-1,y:-1}, {x:-1,y:0}, {x:-1,y:1}, {x:0,y:1}, {x:1,y:1}, {x:1,y:0}, {x:1,y:-1}, {x:0,y:-1}];

    let i = 0;
    while(dir_coord[i].x !== dir1.x || dir_coord[i].y !== dir1.y)
        i++;

    let j = 0;
    while(dir_coord[j].x !== dir2.x || dir_coord[j].y !== dir2.y)
        j++;

    return Math.abs(i - j) <= tolerance;
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
        if((visible[i].unit === SPECS.CASTLE || visible[i].unit === SPECS.CHURCH) && (visible[i].x - r.me.x) ** 2 + (visible[i].y - r.me.y) ** 2 <= 2)
            return visible[i];
    }
}

//tolerance 0 = 0~30 degrees, 1 =  90~120 degrees, 2 = 180~210 degrees
export function getFuzzyMoves(r,dx,dy,radius,tolerance) {

    let possibleMoves = getMoves(radius);
    let dir = [directionTo(dx, dy, r)];

    if (tolerance >= 1) {
        if(Math.random() > 0.5) {
            dir.push(rotateRight(dir[0], 1));
            dir.push(rotateLeft(dir[0], 1));
        } else {
            dir.push(rotateLeft(dir[0], 1));
            dir.push(rotateRight(dir[0], 1));
        }

    }
    let moves = [];
    for (let j = 0;j < dir.length;j++) {
        for (let i = 0;i < possibleMoves.length;i++) {
            let currentDir = directionTo(possibleMoves[i].x,possibleMoves[i].y,r);
            if (currentDir.x === dir[j].x && currentDir.y === dir[j].y)
                moves.push(possibleMoves[i]);
        }
    }
    shuffleArray(moves);
    moves.unshift(dir[0]);

    if (tolerance >= 2) {
        if(Math.random() > 0.5) {
            dir.push(rotateRight(dir[0], 2));
            dir.push(rotateLeft(dir[0], 2));
        } else {
            dir.push(rotateLeft(dir[0], 2));
            dir.push(rotateRight(dir[0], 2));
        }
        let moves2 = [];
        for (let j = 2;j < dir.length;j++) {
            for (let i = 0;i < possibleMoves.length;i++) {
                let currentDir = directionTo(possibleMoves[i].x,possibleMoves[i].y,r);
                if (currentDir.x === dir[j].x && currentDir.y === dir[j].y)
                    moves2.push(possibleMoves[i]);
            }
        }
        shuffleArray(moves2);
        moves = moves.concat(moves2);
    }

    return moves;
}

export function getFuzzyMoves2(r,dx,dy,r_squared,tolerance) {

    let possibleMoves = getMoves2(r_squared);
    let dir = [directionTo(dx, dy, r)];


    if (tolerance >= 1) {
        if(Math.random() > 0.5) {
            dir.push(rotateRight(dir[0], 1));
            dir.push(rotateLeft(dir[0], 1));
        } else {
            dir.push(rotateLeft(dir[0], 1));
            dir.push(rotateRight(dir[0], 1));
        }

    }
    let moves = [];
    for (let j = 0;j < dir.length;j++) {
        for (let i = 0;i < possibleMoves.length;i++) {
            let currentDir = directionTo(possibleMoves[i].x,possibleMoves[i].y,r);
            if (currentDir.x === dir[j].x && currentDir.y === dir[j].y)
                moves.push(possibleMoves[i]);
        }
    }
    shuffleArray(moves);
    moves.unshift(dir);

    if (tolerance >= 2) {
        if(Math.random() > 0.5) {
            dir.push(rotateRight(dir[0], 2));
            dir.push(rotateLeft(dir[0], 2));
        } else {
            dir.push(rotateLeft(dir[0], 2));
            dir.push(rotateRight(dir[0], 2));
        }
        let moves2 = []
        for (let j = 2;j < dir.length;j++) {
            for (let i = 0;i < possibleMoves.length;i++) {
                let currentDir = directionTo(possibleMoves[i].x,possibleMoves[i].y,r);
                if (currentDir.x === dir[j].x && currentDir.y === dir[j].y)
                    moves2.push(possibleMoves[i]);
            }
        }
        shuffleArray(moves2);
        moves = moves.concat(moves2);
    }
    return moves;
}

export function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
export function fuzzyMove2(r,dx,dy,r_squared,tolerance) {

    let moves = getFuzzyMoves2(r,dx,dy,r_squared,tolerance);
    let rmap = r.getVisibleRobotMap();
    for (let i = 0;i < moves.length;i++) {

        const next = {x:r.me.x + moves[i].x,y:r.me.y + moves[i].y};

        if (withInMap(next,r) && r.map[next.y][next.x] && rmap[next.y][next.x] === 0) {

            return r.move(moves[i].x,moves[i].y);
        }
    }
}

export function fuzzyMove(r,dx,dy,radius,tolerance) {

    let rmap = r.getVisibleRobotMap();

    const next = {x:r.me.x + dx,y:r.me.y + dy};
    if(withInMap(next, r) && r.map[next.y][next.x] && rmap[next.y][next.x] === 0)
        return r.move(dx, dy);

    let moves = getFuzzyMoves(r,dx,dy,radius,tolerance);
    for (let i = 0;i < moves.length;i++) {

        const next = {x:r.me.x + moves[i].x,y:r.me.y + moves[i].y};

        if (withInMap(next,r) && r.map[next.y][next.x] && rmap[next.y][next.x] === 0) {

            return r.move(moves[i].x,moves[i].y);
        }
    }
}

export function withInMap(coord,r) {

    return coord.x >= 0 && coord.y >= 0 && coord.x < r.map.length && coord.y < r.map.length;
}

export function getResourceClusters(karb_map, fuel_map, cluster_radius, castles, r) {
    let karb_coords = resourceCoords(r.map, karb_map, {x: r.me.x, y: r.me.y}, getMoves(2), r);
    let fuel_coords = resourceCoords(r.map, fuel_map, {x: r.me.x, y: r.me.y}, getMoves(2), r);
    let coords = karb_coords.concat(fuel_coords);

    let centers = [];

    while(coords.length > 0) {
        let center = coords[0];

        centers.unshift({x: 0, y: 0, karb_count: 0,fuel_count:0});

        let j = 0;
        for(let i=0;i<coords.length;i++) {
            if((coords[i].x - center.x) ** 2 + (coords[i].y - center.y) ** 2 >= cluster_radius ** 2) {
                coords[j++] = coords[i];
            } else {

                if (karb_map[coords[i].y][coords[i].x]) {
                    centers[0].karb_count++;
                } else {
                    centers[0].fuel_count++;
                }
                centers[0].x += coords[i].x;
                centers[0].y += coords[i].y;
            }
        }
        centers[0].x = Math.floor(centers[0].x / (centers[0].karb_count + centers[0].fuel_count));
        centers[0].y = Math.floor(centers[0].y / (centers[0].karb_count + centers[0].fuel_count));
        coords.length = j;
    }

    let real_centers = [];

    for(let i=0;i<centers.length;i++) {
        let close = false;
        for(let j=0;j<castles.length;j++) {
            if((centers[i].x - castles[j].x) ** 2 + (centers[i].y - castles[j].y) ** 2 <= cluster_radius ** 2)
                close = true;
        }

        if(!close)
            real_centers.push(freeChurchTile(centers[i], karb_map, fuel_map));
    }


    real_centers =  real_centers.sort(function(a,b) {

        let a_sym_distance = symmDistance(r,a.x,a.y);
        let b_sym_distance = symmDistance(r,b.x,b.y);
        let a_value = a.karb_count + a.fuel_count * 1.5;
        let b_value = b.karb_count + b.fuel_count * 1.5;

        if (a_sym_distance < 5)  a_value *= 2;
        if (b_sym_distance < 5) b_value *= 2;

        a_value -= a_sym_distance * 0.05;
        b_value -= b_sym_distance * 0.05;

        return b_value - a_value;
    });
    //r.log('real centers');
    //r.log(real_centers);
    return real_centers
}

function hasAdjacentResourceTile(x, y, karb_map, fuel_map) {
    let dir_coord = [{x:0,y:-1}, {x:1,y:-1}, {x:1,y:0}, {x:1,y:1}, {x:0,y:1}, {x:-1,y:1}, {x:-1,y:0}, {x:-1,y:-1}];

    for(let i=0;i<dir_coord.length;i++) {
        let newX = x + dir_coord[i].x;
        let newY = y + dir_coord[i].y;

        if(newX >= 0 && newY >= 0 && newX < karb_map.length && newY < karb_map.length && (karb_map[newY][newX] || fuel_map[newY][newX])) {
            return true;
        }
    }

    return false;
}

export function freeChurchTile(initial_pos, karb_map, fuel_map) {
    let dx = 0;
    let dy = 0;
    let delta = [0,-1];
    for(let i=0;i<constants.CLUSTER_RADIUS**2;i++) {
        let newX = initial_pos.x + dx;
        let newY = initial_pos.y + dy;

        if (newX >= 0 && newY >= 0 && newX < karb_map.length && newY < karb_map.length && !karb_map[newY][newX] && !fuel_map[newY][newX] && hasAdjacentResourceTile(newX, newY, karb_map, fuel_map))
            return {x: newX, y: newY, karb_count: initial_pos.karb_count,fuel_count: initial_pos.fuel_count};

        if (dx === dy || (dx < 0 && dx === -dy) || (dx > 0 && dx === 1 - dy))
            delta = [-delta[1], delta[0]];

        dx += delta[0];
        dy += delta[1];
    }

    return {x: initial_pos.x + dx, y: initial_pos.y + dy, karb_count: initial_pos.karb_count,fuel_count: initial_pos.fuel_count};
}

export function freeOffensiveChurch(r) {
    let dx = 0;
    let dy = 0;
    let delta = [0,-1];
    let initial_pos = {x: r.me.x, y: r.me.y};
    let visibleMap = r.getVisibleRobotMap();

    for(let i=0;i<constants.CLUSTER_RADIUS**2;i++) {
        let newX = initial_pos.x + dx;
        let newY = initial_pos.y + dy;

        if (newX >= 0 && newY >= 0 && newX < r.map.length && newY < r.map.length && r.map[newY][newX] && visibleMap[newY][newX] === 0)
            return {x: newX, y: newY};

        if (dx === dy || (dx < 0 && dx === -dy) || (dx > 0 && dx === 1 - dy))
            delta = [-delta[1], delta[0]];

        dx += delta[0];
        dy += delta[1];
    }
}

export function getNearestResourceTile(r) {
    let dx = 0;
    let dy = 0;
    let delta = [0,-1];
    for(let i=0;i<constants.CLUSTER_RADIUS**2;i++) {
        let newX = r.me.x + dx;
        let newY = r.me.y + dy;

        if (withInMap({x: newX, y: newY}, r) && (r.karbonite_map[newY][newX] || r.fuel_map[newY][newX]))
            return {x: newX, y: newY, code: r.karbonite_map[newY][newX] ? constants.PILGRIM_JOBS.MINE_KARBONITE : constants.PILGRIM_JOBS.MINE_FUEL};

        if (dx === dy || (dx < 0 && dx === -dy) || (dx > 0 && dx === 1 - dy))
            delta = [-delta[1], delta[0]];

        dx += delta[0];
        dy += delta[1];
    }
}

export function getNearestResourceTile2(r, pos) {
    let dx = 0;
    let dy = 0;
    let delta = [0,-1];
    for(let i=0;i<constants.CLUSTER_RADIUS**2;i++) {
        let newX = pos.x + dx;
        let newY = pos.y + dy;

        if (withInMap({x: newX, y: newY}, r) && (r.karbonite_map[newY][newX] || r.fuel_map[newY][newX]))
            return {x: newX, y: newY, code: r.karbonite_map[newY][newX] ? constants.PILGRIM_JOBS.MINE_KARBONITE : constants.PILGRIM_JOBS.MINE_FUEL};

        if (dx === dy || (dx < 0 && dx === -dy) || (dx > 0 && dx === 1 - dy))
            delta = [-delta[1], delta[0]];

        dx += delta[0];
        dy += delta[1];
    }
}

//return a deep copy of a 2d array
export function copy(array) {
    let newArray = [];
    for(let i=0;i<array.length;i++)
        newArray[i] = array[i].slice();

    return newArray;
}

export function safetyMap(r, enemy_castles) {
    let map = copy(r.map);

    for(let k=0;k<enemy_castles.length;k++) {

        for(let i=-10;i<=10;i++) {
            for(let j=-10;j<=10;j++) {
                if(i ** 2 + j ** 2 > 64) continue;

                let newX = enemy_castles[k].x + i;
                let newY = enemy_castles[k].y + j;

                if(withInMap({x: newX, y: newY}, r)) {
                    map[newY][newX] = false;
                }
            }
        }
    }

    return map;
}

export function isEnemyDepositSafe(r, location, safety_map) {
    let path_map = BFSMap(safety_map, location, getMoves(2));
    return !(path_map[r.me.y][r.me.x] === 0);
}

export function symmDistance(r, x, y) {
    if(isHorizontallySymm(r)) {
        return Math.abs(y - Math.floor(r.map.length / 2));
    } else {
        return Math.abs(x - Math.floor(r.map.length / 2));
    }
}

//passable, karbonite, and fuel map combined
export function combinedMap(r) {
    let map = copy(r.map);
    let kmap = r.karbonite_map;
    let fmap = r.fuel_map;
    for (let i = 0;i < map.length;i++) {
        for (let j = 0;j < map.length;j++) {
            if (kmap[j][i] || fmap[j][i]) {
                map[j][i] = false;
            }
        }
    }
    return map;
}


export function crusaderLocation(r,enemyCastles,location) {
    // let nearest_castle = enemyCastles[0];
    // let nearest_distance = (location.y - enemyCastles[0].y) ** 2 + (location.x - enemyCastles[0].x) ** 2;
    // for (let i = 1;i < enemyCastles.length;i++) {
    //     let distance = (location.y - enemyCastles[i].y) ** 2 + (location.x - enemyCastles[i].x) ** 2;
    //     if (distance )
    //
    // }
    for(let i=0;i<constants.CLUSTER_RADIUS**2;i++) {
        let newX = initial_pos.x + dx;
        let newY = initial_pos.y + dy;

        if (newX >= 0 && newY >= 0 && newX < karb_map.length && newY < karb_map.length && !karb_map[newY][newX] && !fuel_map[newY][newX])
            return {x: newX, y: newY, karb_count: initial_pos.karb_count,fuel_count: initial_pos.fuel_count};

        if (dx === dy || (dx < 0 && dx === -dy) || (dx > 0 && dx === 1 - dy))
            delta = [-delta[1], delta[0]];

        dx += delta[0];
        dy += delta[1];
    }
}

export function offensivePilgrimGoal(r, coord) {
    if(isHorizontallySymm(r)) {
        let goalX = coord.x;
        let goalY = (coord.y < r.map.length / 2) ? r.map.length - 1 : 0;
        return {x: goalX, y: goalY};
    } else {
        let goalX = (coord.x < r.map.length / 2) ? r.map.length - 1 : 0;
        let goalY = coord.y;
        return {x: goalX, y: goalY};
    }
}