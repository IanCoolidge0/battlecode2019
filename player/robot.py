from battlecode import BCAbstractRobot, SPECS
import battlecode as bc
import random
import church
import castle
import crusader
import pilgrim
import preacher
import prophet
import util




__pragma__('iconv')
__pragma__('tconv')
__pragma__('opov')


# The directions: North, NorthEast, East, SouthEast, South, SouthWest, West, NorthWest
directions = { 'North':(0, -1), 'NorthEast':(1, -1), 'East' :(1, 0), 'SouthEast':(1, 1),
               'South':(0, 1), 'SouthWest': (-1, 1), 'West':(-1, 0), 'NorthWest': (-1, -1)}
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


def direction_to(x, y, goal_x, goal_y):
    dx, dy = goal_x - x, y - goal_y

    if dy == 0 and dx == 0:
        raise Exception
    if dy == 0:
        return directions['East'] if dx > 0 else directions['West']
    if dx == 0:
        return directions['North'] if dy > 0 else directions['South']

    angle = (0.0 + dy) / dx

    if  angle < -2.41:
        return directions['North'] if dy > 0 else directions['South']
    elif angle < -0.414:
        return directions['NorthWest'] if dy > 0 else directions['SouthEast']
    if  angle < 0.414:
        return directions['East'] if dx > 0 else directions['West']
    elif angle <= 2.41:
        return directions['NorthEast'] if dx > 0 else directions['SouthWest']






# don't try to use global variables!!
class MyRobot(BCAbstractRobot):
    step = -1

    def turn(self):
        if self.step == -1:
            util.path(self.map,(self.me.x,self.me.y),(self.me.x + 10, self.me.y + 10),util.get_moves(9),self)
        self.step += 1



robot = MyRobot()
