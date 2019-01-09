from battlecode import BCAbstractRobot, SPECS
import battlecode as bc
import random
from .util import Path


__pragma__('iconv')
__pragma__('tconv')
#__pragma__('opov')

# don't try to use global variables!!
class MyRobot(BCAbstractRobot):
    step = -1

    def turn(self):
        self.step += 1
        if self.step == 0:
            for i in self.karbonite_map:
        self.log("START TURN " + self.step)
        if self.me['unit'] == SPECS['CRUSADER']:
            self.log(str(self.fuel) + "fuel: " + str(self.me.fuel) + " karbonite:" + str(self.me.karbonite))
            self.log("Crusader position: " + str(self.me.x) + ", " +  str(self.me.y))
            # The directions: North, NorthEast, East, SouthEast, South, SouthWest, West, NorthWest
            choices = [(0, -1), (1, -1), (1, 0), (1, 1), (0, 1), (-1, 1), (-1, 0), (-1, -1)]
            choice = random.choice(choices)
            self.log('TRYING TO MOVE IN DIRECTION ' + str(choice))
            return self.move(*choice)

        elif self.me['unit'] == SPECS['PILGRIM']:
            choices = [(0, -1), (1, -1), (1, 0), (1, 1), (0, 1), (-1, 1), (-1, 0), (-1, -1)]
            choice = random.choice(choices)
            self.log('TRYING TO MOVE IN DIRECTION ' + str(choice))
            return self.move(*choice)
            pass

        elif self.me['unit'] == SPECS['CASTLE']:
            if self.karbonite > 20:
                self.log("Building a Crusader at " + str(self.me['x']) + ", " + str(self.me['y']))
                return self.build_unit(SPECS['CRUSADER'], 1, 1)

            else:
                return self.build_unit(SPECS['PILGRIM'],1,1)


robot = MyRobot()
