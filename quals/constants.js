
export const LATTICE_RADIUS = 6;
export const INIT_CASTLETALK = 255;
export const PILGRIM_DANGER_CASTLETALK = 1;

export const CLUSTER_RADIUS = 5;
export const ENEMY_PREACHER = 15;
export const ENEMY_PROPHET = 14;
export const ENEMY_CRUSADER = 13;

export const WALL_FANOUT = 10;
export const WALL_WAIT = 20;

export const PILGRIM_JOBS = {
    MINE_KARBONITE: 0,
    MINE_FUEL: 1,
    BUILD_CHURCH: 2,
    BUILD_ENEMY_CHURCH: 3,
    OFFENSIVE: 4,
    BUILD_WALL: 5,
    SCOUT: 6,
    BUILD_WALL_SUBSEQUENT: 7
};

export const PILGRIM_MODE = {
    MOVE_TO_RESOURCE: 0,
    MINE_RESOURCE: 1,
    MOVE_TO_CASTLE: 2,
    FLEE: 3,
    MOVE_OFFENSIVE: 4,
    NOTHING: 5
};

export const PROPHET_JOBS = {
    DEFEND_CASTLE:[0,1,2,3,4,5,6,7],
    REINFORCE_PILGRIM: 8,
    DEFEND_GOAL: 9,


};

export const PROPHET_MODE = {
    PATH_TO_GOAL: 0,
    DEFEND: 1,
    ATTACK: 2,
    REINFORCE: 3,
    DEFEND_CASTLE:4,
    MOVE_AWAY:5,
};


export const PREACHER_JOBS = {
    DEFEND_CASTLE:[0,1,2,3,4,5,6,7],
    DEFEND_GOAL: 8
};

export const PREACHER_MODE = {
    DEFEND_CASTLE:0,
    ATTACK_CASTLE:1,
    PATH_TO_GOAL: 0,
    DEFEND: 1,
    ATTACK: 2,
    REINFORCE: 3,

};
export const CRUSADER_JOBS = {
    DEFEND_GOAL: 0,
    DEFEND_ENEMY_CHURCH:1
};
export const CRUSADER_MODE = {
    PATH_TO_GOAL: 0,
    DEFEND: 1,
    CHAAAAAAAARGE:2,
    PATH_TO_CHURCH: 3,

};





export const SIGNAL_CODE = {
    REQUEST_REASSIGN: 0,
    CASTLE_POS: 1,
    INIT_SIGNAL: 2,
    ALIVE_SIGNAL: 3,
    CREATE_ENEMY_CHURCH: 4,
    CREATE_FRIENDLY_CHURCH: 5,
    CREATE_OFFENSIVE_CHURCH: 6,
    SCOUT_INFO: 7,
    DONE_SCOUTING: 8
};

