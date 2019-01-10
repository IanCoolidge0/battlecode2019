import random


def crusader_step(r):
    r.log("Crusader health: " + str(r.me['health']))
    # The directions: North, NorthEast, East, SouthEast, South, SouthWest, West, NorthWest
    choices = [(0, -1), (1, -1), (1, 0), (1, 1), (0, 1), (-1, 1), (-1, 0), (-1, -1)]
    choice = random.choice(choices)
    r.log('TRYING TO MOVE IN DIRECTION ' + str(choice))
    return r.move(*choice)

def attack():
    pass