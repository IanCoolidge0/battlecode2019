
class PathfindingMap(object):

    def __init__(self, sx, sy):
        self._map = [[0] * sy for _ in range(sx)]

    def set(self, pos, value):
        x, y = pos
        self._map[x][y] = value

    def get(self, pos):
        x, y = pos
        return self._map[x][y]

    def size(self):
        return len(self._map), len(self._map[0])


def get_moves(r):
    moves = []
    for i in range(-r,r+1):
        for j in range(-r,r+1):
            if i == 0 and j == 0:
                continue
            if i ** 2 + j ** 2 <= r ** 2:
                moves.append((i, j))
    return moves

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


def path_map(pass_map, start, moves):
    size = pass_map.size()
    pmap = PathfindingMap(size[0], size[1])
    visited = PathfindingMap(size[0], size[1])

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

def karbonite_coords(pass_map, karbonite_map, start, moves, r):
    size = len(pass_map)
    visited = [[False] * size for _ in range(size)]
    coords = [start[0]][start[1]] = 1

    queue = [start]

    while len(queue) > 0:
        current_pos = queue.pop(0)

        if karbonite_map[current_pos[1]][current_pos[0]]:
            coords.append(current_pos)

        for move in moves:
            next_x, next_y = current_pos[0] + move[0], current_pos[1] + move[1]

            if min(next_x, next_y) < 0 or max(next_x, next_y) >= size:
                continue

            if visited[next_y][next_x] or pass_map[next_y][next_x]:
                continue

            if (next_x, next_y) not in queue:
                queue.append((next_x, next_y))

        visited[current_pos[1]][current_pos[0]] = True

    return coords
def path(pass_map,start,end,moves,r):
    size = len(pass_map)
    visited = [[False] * size for _ in range(size)]
    visited[start[0]][start[1]] = 1
    queue = [start]

    # while len(queue) > 0 or end in queue:
    #     current_pos = queue.pop(0)
    #
    #     for move in moves:
    #         next_pos = (current_pos[0] + move[0], current_pos[1] + move[1])
    #
    #         if next_pos[0] < 0 or next_pos[1] < 0 or next_pos[0] >= size[0] or next_pos[1] >= size[1]:
    #             continue
    #
    #         if visited[next_pos[0],next_pos[1]] == False or pass_map[next_pos[0],next_pos[1]] == 1:
    #             continue
    #
    #         if next_pos not in queue:
    #             visited[next_pos[0]][next_pos[1]] =  move
    #             queue.append(next_pos)

    r.log(visited)
