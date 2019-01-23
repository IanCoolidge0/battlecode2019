import {SPECS} from 'battlecode';
import * as constants from "./constants.js"

export function logBuiltUnit(r, unit, x, y, job) {
    let unit_name;
    let job_name = "";

    if(unit === SPECS.CASTLE)
        unit_name = "castle";
    else if(unit === SPECS.CHURCH)
        unit_name = "church";
    else if(unit === SPECS.PILGRIM) {
        unit_name = "pilgrim";
        for(let name in constants.PILGRIM_JOBS)
            if(constants.PILGRIM_JOBS[name] === job)
                job_name = name;
    }
    else if(unit === SPECS.CRUSADER) {
        unit_name = "crusader";
        for(let name in constants.CRUSADER_JOBS)
            if(constants.CRUSADER_JOBS[name] === job)
                job_name = name;
    }
    else if(unit === SPECS.PREACHER) {
        unit_name = "preacher";
        for(let name in constants.PREACHER_JOBS)
            if(constants.PREACHER_JOBS[name] === job)
                job_name = name;
    }
    else if(unit === SPECS.PROPHET) {
        unit_name = "prophet";
        for(let name in constants.PROPHET_JOBS)
            if(constants.PROPHET_JOBS[name] === job)
                job_name = name;
    }
    r.log("built a " + unit_name + " at " + x + "," + y + " with job " + job_name);
}