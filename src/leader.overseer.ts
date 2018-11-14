export function oversee(creepNames: string[]) {
    //
    const SPAWNNAME = 'Spawn1';
    const SUPPLY = 'Supply';
    const REPAIR = 'Repair';
    const BUILD = 'Build';
    const CONTROL = 'Control';
    const creeps = Memory.creeps;

    const OVERSEERMIKE = Memory.spawns[SPAWNNAME].overseerMemory;

    let taskList: Task[] = [];
    if (OVERSEERMIKE !== undefined) {
        if (OVERSEERMIKE.taskList !== undefined) {
            taskList = OVERSEERMIKE.taskList;
        }
    }
    console.log(`TaskList: ${JSON.stringify(taskList)}`);

    const rooms = Game.rooms;

    const needEnergy: string[] = [];
    const toBuild: string[] = [];
    const toRepair: string[] = [];
    const newTaskList: Task[] = [];

    for (const r in rooms) {
        const room = rooms[r];
        if (OVERSEERMIKE !== undefined) {
            needEnergy.push(...room.find(FIND_MY_STRUCTURES, {
                // Find all object that need energy in the room, and add them to the list
                filter: (s: AnyOwnedStructure) => {
                    if ((s.structureType === STRUCTURE_SPAWN
                        || s.structureType === STRUCTURE_EXTENSION
                        || s.structureType === STRUCTURE_TOWER)
                        && (taskList.findIndex(t => t.item === s.id) === -1)) {
                        return s.energy < s.energyCapacity
                    }
                    return false;
                }
            }).map(s => s.id));
            OVERSEERMIKE.needEnergy = needEnergy;
        }

        if (OVERSEERMIKE !== undefined) {
            toBuild.push(...room.find(FIND_CONSTRUCTION_SITES, {
                filter: (c: ConstructionSite) => {
                    return (taskList.findIndex(t => t.item === c.id) === -1);
                }
            }).map(s => s.id));
            OVERSEERMIKE.toBuild = toBuild;
        }

        if (OVERSEERMIKE !== undefined) {
            toRepair.push(...room.find(FIND_STRUCTURES, {
                filter: (s: AnyStructure) => {
                    if (!(s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_CONTROLLER)
                        && !(s.hits > (s.hitsMax - 200))
                        && (taskList.findIndex(t => t.item === s.id) === -1)) {
                        return true;
                    } return false;
                }
            }).map(s => s.id));
            OVERSEERMIKE.toRepair = toRepair;
        }

        if (room.controller !== undefined) {
            const id = room.controller.id;
            if (room.controller.ticksToDowngrade < 4000 && taskList.findIndex(t => t.item === id && t.type === CONTROL) === -1) {
                newTaskList.push({
                    assigned: null,
                    emojii: '🐨',
                    item: id,
                    type: CONTROL
                });
            }
        }



    }

    newTaskList.push(...taskList.filter((task: Task) => {
        return task.type === CONTROL;
    }));


    //////////////////////////////////////////////////
    //// Add All the Tasks that involve supplying ////
    //////////////////////////////////////////////////
    // console.log(`Needs energy: ${needEnergy}`);
    needEnergy.forEach((s: string) => {
        //
        newTaskList.push({
            assigned: null,
            emojii: '🐭',
            item: s,
            type: SUPPLY
        })
    });

    newTaskList.push(...taskList.filter((task: Task) => {
        return task.type === SUPPLY;
    }));

    //////////////////////////////////////////////////
    //// Add All the Tasks that involve repairing ////
    //////////////////////////////////////////////////
    // console.log(`Needs repair: ${toRepair}`);
    toRepair.forEach((s: string) => {
        //
        newTaskList.push({
            assigned: null,
            emojii: '🔧',
            item: s,
            type: REPAIR
        })
    });

    newTaskList.push(...taskList.filter((task: Task) => {
        return task.type === REPAIR;
    }));

    ////////////////////////////////////////////////
    //// Add all the tasks the involve building ////
    ////////////////////////////////////////////////
    // console.log(`Needs building: ${toBuild}`);
    toBuild.forEach((s: string) => {
        //
        newTaskList.push({
            assigned: null,
            emojii: '👷🏼',
            item: s,
            type: BUILD
        })
    });

    newTaskList.push(...taskList.filter((task: Task) => {
        return task.type === BUILD;
    }));


    taskList = newTaskList;




    taskList.forEach((task: Task) => {
        let freeCreep: string = '';
        for (const creep in creeps) {
            //
            if (creeps[creep].task === null) {
                freeCreep = creep;
                // break;
            }
        }
        if (task.assigned !== null) {
            if (creepNames.includes(task.assigned)) {
                //
            } else {
                task.assigned = null;
                if (freeCreep !== '') {
                    creeps[freeCreep].task = task;
                    task.assigned = freeCreep;
                }
            }
        } else {
            if (freeCreep !== '') {
                console.log(`freeCreep: ${freeCreep}`);
                creeps[freeCreep].task = task;
                task.assigned = freeCreep;
            }
        }
    });
    if (OVERSEERMIKE !== undefined) {
        OVERSEERMIKE.taskList = taskList;
    }

}
