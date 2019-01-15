
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