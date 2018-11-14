import { finished } from "stream";

export function roleWorker(creep: Creep) {

    const SPAWNNAME = 'Spawn1';
    const SUPPLY = 'Supply';
    const REPAIR = 'Repair';
    const BUILD = 'Build';
    const CONTROL = 'Control';
    const OVERSEERMIKE = Memory.spawns[SPAWNNAME].overseerMemory;


    // If the creep is out of energy it's time to mine
    if (creep.memory.mining === false && creep.carry.energy === 0) {
        creep.memory.mining = true;
    }
    // If the creep is mining and can't hold anymore, stop mining
    else if (creep.memory.mining === true && creep.carry.energy === creep.carryCapacity) {
        creep.memory.mining = false;
    }

    // When i'm not mining it's time to do my task
    if (creep.memory.mining === false) {
        let task: Task;
        if (creep.memory.task !== null) {
            // What's my task
            task = creep.memory.task;
            if (creep.ticksToLive !== undefined) {
                if (creep.ticksToLive % 50 === 0 || creep.ticksToLive % 51 === 0) {
                    creep.say(`${task.emojii}`);
                }
            }
            // If supply go drop off your energy
            if (task.type === SUPPLY) {
                const structure = Game.getObjectById(task.item);
                if (structure !== null) {
                    if (creep.transfer(structure as Structure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.travelTo(structure as Structure);
                    }
                }
            } else if (task.type === REPAIR) {
                const structure = Game.getObjectById(task.item);
                if (structure !== null) {
                    if (creep.repair(structure as Structure) === ERR_NOT_IN_RANGE) {
                        creep.travelTo(structure as Structure);
                    }
                }
            } else if (task.type === BUILD) {
                const structure = Game.getObjectById(task.item);
                if (structure !== null) {
                    if (creep.build(structure as ConstructionSite) === ERR_NOT_IN_RANGE) {
                        creep.travelTo(structure as ConstructionSite)
                    }
                }
            } else if (task.type === CONTROL) {
                const structure = Game.getObjectById(task.item);
                if (structure !== null) {
                    if (creep.upgradeController(structure as StructureController) === ERR_NOT_IN_RANGE) {
                        creep.travelTo(structure as StructureController);
                    }
                }
            }

            // Did I finish my task
            if (task.type === SUPPLY) {
                const structure = Game.getObjectById(task.item);
                if (structure !== null) {
                    if ((structure as StructureExtension).energy === (structure as StructureExtension).energyCapacity) {
                        removeTask(task);
                    }
                }
            } else if (task.type === REPAIR) {
                const structure = Game.getObjectById(task.item);
                if (structure !== null) {
                    if ((structure as Structure).hits > (structure as Structure).hitsMax - 100) {
                        removeTask(task);
                    }
                }
            } else if (task.type === BUILD) {
                // console.log('build');
                const structure = Game.getObjectById(task.item);
                if (structure === null) {
                    removeTask(task);
                }
            } else if (task.type === CONTROL) {
                const structure = Game.getObjectById(task.item);
                console.log(`Ticks Left: ${(structure as StructureController).ticksToDowngrade}`);
                if ((structure as StructureController).ticksToDowngrade > 4950) {
                    removeTask(task);
                }
            }

        }
        else {
            creep.say(`I'm 😶`);
            if (creep.room.controller !== undefined) {
                if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(creep.room.controller);
                }
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
                creep.travelTo(source, { ignoreRoads: true });
            }
        }
    }
    function removeTask(task: Task) {
        if (OVERSEERMIKE !== undefined) {
            const taskList = OVERSEERMIKE.taskList;
            const newTL = taskList.filter(t => t.item !== task.item);
            OVERSEERMIKE.taskList = newTL;
        }
        creep.memory.task = null;
        creep.say(`${task.emojii} done`);
    }
}
