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


# don't try to use global variables!!
class MyRobot(BCAbstractRobot):
    step = -1

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
