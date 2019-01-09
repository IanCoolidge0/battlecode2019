
def castle_step(r):
    if r.step < 10:
        r.log("Building a crusader at " + str(r.me['x'] + 1) + ", " + str(r.me['y'] + 1))
        return r.build_unit(SPECS['CRUSADER'], 1, 1)

    else:
        r.log("Castle health: " + r.me['health'])
