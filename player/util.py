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

def direction