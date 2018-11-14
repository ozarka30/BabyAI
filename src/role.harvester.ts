
export function
    // a function to run the logic for this role
    roleHarvester(creep: Creep) {

    const TIME_TO_RESET = 4500;
    // if creep is bringing energy to a structure but has no energy left
    if (creep.memory.working === true && creep.carry.energy === 0) {
        // switch state
        creep.memory.working = false;
    }
    // if creep is harvesting energy but is full
    else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
        // switch state
        creep.memory.working = true;
    }

    // if creep is supposed to transfer energy to a structure
    if (creep.memory.working === true) {
        // find closest spawn, extension or tower which is not full
        const structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            // the second argument for findClosestByPath is an object which takes
            // a property called filter which can be a function
            // we use the arrow operator to define it
            filter: (s: Structure) => {
                if (s.structureType === STRUCTURE_SPAWN
                    || s.structureType === STRUCTURE_EXTENSION
                    || s.structureType === STRUCTURE_TOWER) {
                    return (s as StructureExtension).energy < (s as StructureExtension).energyCapacity
                }
                return false;
            }
        });

        const toConstruct = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

        const buildingToRepair = creep.pos.findClosestByPath(FIND_STRUCTURES, {

            filter: (s: Structure) => {
                if (s.structureType !== STRUCTURE_WALL) {
                    return (s.hits < s.hitsMax - 200);
                } return false;
            }
        });

        // if we found one
        if (structure !== null) {
            // try to transfer energy, if it is not in range
            // console.log('Refill Enegry?')
            if (creep.transfer(structure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                // move towards it
                // creep.moveTo(structure);
                creep.travelTo(structure);
            }
        } else if (creep.room.controller !== undefined && creep.room.controller.ticksToDowngrade.valueOf() < TIME_TO_RESET) {
            // console.log('Refresh Controller?')
            if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.travelTo(creep.room.controller);
            }
        } else if (buildingToRepair !== null) {
            // console.log('Repair Building?')
            if (creep.repair(buildingToRepair) === ERR_NOT_IN_RANGE) {
                creep.travelTo(buildingToRepair);
            }
        } else if (toConstruct !== null) {
            // console.log('Construct Building?')
            if (creep.build(toConstruct as ConstructionSite) === ERR_NOT_IN_RANGE) {
                creep.travelTo(toConstruct as ConstructionSite);
            }
        } else if (creep.room.controller !== undefined) {
            // console.log('Upgrade Controller?')
            if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.travelTo(creep.room.controller);
            }
        }

    }
    // if creep is supposed to harvest energy from source
    else {
        // find closest source
        const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        if (source !== null) {
            // try to harvest energy, if the source is not in range
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                // move towards the source
                // creep.moveTo(source);
                creep.travelTo(source);
            }
        }
    }
}
