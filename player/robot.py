from battlecode import BCAbstractRobot, SPECS
import battlecode as bc
import random
import player.church as church
import player.castle as castle
import player.crusader as crusader
import player.pilgrim as pilgrim
import player.preacher as preacher
import player.prophet as prophet
import player.util as util




__pragma__('iconv')
__pragma__('tconv')
__pragma__('opov')


def get_moves(r):
    moves = []
    for i in range(-r,r+1):
        for j in range(-r,r+1):
            if i == 0 and j == 0:
                continue
            if i ** 2 + j ** 2 <= r ** 2:
                moves.append((i, j))
    return moves


def path_map(pass_map, start, moves):
    size = pass_map.size()
    pmap = util.PathfindingMap(size[0], size[1])
    visited = util.PathfindingMap(size[0], size[1])

    queue = [start]

    while len(queue) > 0:
        current_pos = queue.pop(0)

        for move in moves:
            next_pos = (current_pos[0] + move[0], current_pos[1] + move[1])

            if next_pos[0] < 0 or next_pos[1] < 0 or next_pos[0] >= size[0] or next_pos[1] >= size[1]:
                continue

            if visited.get(next_pos) == 1 or pass_map.get(next_pos) == 1:
                continue

            if next_pos not in queue:
                pmap.set(next_pos, move)
                queue.append(next_pos)

        visited.set(current_pos, 1)

    return pmap


# test
x = util.PathfindingMap(5,5)

print(path_map(x, (0,0), [(0,1),(1,0),(0,-1),(-1,0)])._map)
print(len(get_moves(3)))

"""
def direction_to(x, y, goal_x, goal_y):
    dx, dy = x - goal_x, y - goal_y

    if dy == 0:
        return Direction.EAST if dx > 0 else Direction.WEST
    if dx == 0:
        return Direction.NORTH if dy > 0 else Direction.SOUTH

    angle = (0.0 + dy) / dx

    if angle <= 0.25:
        return Direction.EAST if dx > 0 else Direction.WEST
    elif angle <= 0.75:
        return Direction.NORTHEAST if dx > 0 else Direction.SOUTHWEST
"""


# don't try to use global variables!!
class MyRobot(BCAbstractRobot):
    step = -1
    pass_map = None
    pathfinding_map = None

    def turn(self):
        self.step += 1

        if self.me['unit'] == SPECS['CRUSADER']:
            return crusader.crusader_step(self)
        elif self.me['unit'] == SPECS['PROPHET']:
            return prophet.prophet_step(self)
        elif self.me['unit'] == SPECS['PREACHER']:
            return preacher.preacher_step(self)
        elif self.me['unit'] == SPECS['PILGRIM']:
            return pilgrim.pilgrim_step(self)
        elif self.me['unit'] == SPECS['CHURCH']:
            return church.church_step(self)
        elif self.me['unit'] == SPECS['CASTLE']:
            return castle.castle_step(self)
        else:
            self.log("Unknown unit type found: " + self.me['unit'])


robot = MyRobot()
