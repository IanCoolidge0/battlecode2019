import * as util from "./util.js";
import * as constants from "./constants.js";
import {SPECS} from 'battlecode';
import * as combat from "./combat.js";
import * as logging from "./logging.js";


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

export function passMapToUnweighted(pass_map) {

    let out_map = create2dArray(pass_map.length, pass_map.length, 1);

    for(let i=0;i<pass_map.length;i++) {
        for(let j=0;j<pass_map.length;j++) {
            if(!pass_map[j][i])
                out_map[j][i] = -1;
        }
    }

    return out_map;
}

export function applyInfluence(weighted_map, location, strength) {

    let out_map = create2dArray(weighted_map.length, weighted_map.length, 0);

    for(let i=0;i<weighted_map.length;i++) {
        for(let j=0;j<weighted_map.length;j++) {
            if(weighted_map[j][i] > 0) {
                let dist = (location.x - j) ** 2 + (location.y - i) ** 2;
                out_map[j][i] = weighted_map[j][i] + strength / (1 + dist);
            }
        }
    }

    return out_map;
}

function coord_to_key(coord) {
    return "" + ((coord.y << 6) + coord.x);
}

function key_to_coord(key) {
    let num = parseInt(key);
    return {x: num % 64, y: (num >> 6) % 64};
}

export function BFS_Multiple_Path_Map(r,start,end,moves) {
    let rmap = r.getVisibleRobotMap();
    rmap[end.y][end.x] = 0;
    rmap[start.y][start.x] = 0;

    let size = r.map.length;
    let path_finding_map = create2dArray(size,size,0);

    path_finding_map[end.y][end.x] = 9999999;
    let current_locations = [end];
    let next_locations = [];
    let current_moves = {};
    let count = 0;
    while (current_locations.length > 0) {
        for (let j = 0;j < current_locations.length;j++) {
            count++;
            //r.log("count: " + count);
            //r.log(current_locations);
            let location = current_locations[j];
            if (location.x === start.x && location.y === start.y) return path_finding_map;

            for (let i = 0; i < moves.length; i++) {

                let next_location = {x: location.x + moves[i].x, y: location.y + moves[i].y};
                if (util.withInMap(next_location, r) && path_finding_map[next_location.y][next_location.x] === 0
                    && r.map[next_location.y][next_location.x] && rmap[next_location.y][next_location.y] < 1) {
                    //r.log("reached");
                    let next_loc_num = coord_to_key(next_location);

                    if (current_moves[next_loc_num] === undefined) {
                        current_moves[next_loc_num] = [moves[i]];
                    } else {
                        //r.log('exist');
                        //r.log(current_moves[next_loc_num]);
                        //r.log(moves[i]);
                        current_moves[next_loc_num].push(moves[i]);
                    }
                    //path_finding_map[next_location.y][next_location.x] = i + 1;
                    // r.log("pathfindingmap");
                    // r.log(next_loc_num);
                    // r.log(next_location);
                    // r.log(moves[i]);
                    //r.log(current_moves[next_loc_num]);
                    //r.log("reached 2")
                    let isDuplicate = false;
                    for (let k = 0;k < next_locations.length;k++) {
                        if (next_locations[k].x === next_location.x && next_locations[k].y === next_location.y) {
                            isDuplicate = true;
                            break;
                        }
                    }
                    if (!isDuplicate)
                        next_locations.push(next_location);
                }
            }

        }

        //r.log("keys");
        let keys = Object.keys(current_moves);
        //r.log(keys);
        for (let i = 0; i < keys.length; i++) {
            let next_loc = key_to_coord(keys[i]);
            //r.log(next_loc);
            //r.log(current_moves[keys[i]]);
            path_finding_map[next_loc.y][next_loc.x] = current_moves[keys[i]];
        }
        current_locations = next_locations;
        next_locations = [];
        //
        // r.log(current_moves);
        // current_moves = {};
    }

    return path_finding_map;
}
