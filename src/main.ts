import { ErrorMapper } from "utils/ErrorMapper";
import { oversee } from './leader.overseer';
import { names } from './names';
import { roleHarvester } from './role.harvester';
import { roleWorker } from './role.worker';
import './utils/Traveler';





// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);
  // Automatically delete memory of missing creeps
  const usedNames: string[] = [];
  let numHarvesters = 0;
  const creeps = Memory.creeps;

  for (const name in creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    } else {
      usedNames.push(name);
      const creep: Creep = Game.creeps[name];
      if (creep.memory.role === 'Harvester') {
        numHarvesters++;
      }
      if (creep.ticksToLive !== undefined) {
        if (creep.ticksToLive < 15) {
          creep.say(`⚰️ in ${creep.ticksToLive}`);
        } else if (creep.ticksToLive % 100 === 0 || creep.ticksToLive % 101 === 0) {
          creep.say(`${name}😬`);
        }
      }
    }

  }

  const SPAWNNAME = 'Spawn1';
  const OVERSEER = 'Mike';
  const TOTALENERGY = Game.spawns[SPAWNNAME].room.energyCapacityAvailable;
  const MINIMUM_HARVESTORS = 15;

  if (Memory.spawns === undefined) {
    Memory.spawns = { Spawn1: { name: SPAWNNAME, overseerMemory: { taskList: [], needEnergy: [], toBuild: [], toRepair: [] } } };
  }

  const rName = randomName(usedNames);

  // if (numHarvesters < MINIMUM_HARVESTORS) {
  Game.spawns[SPAWNNAME].spawnCreep(workerBody(TOTALENERGY), rName, { memory: { room: Game.spawns[SPAWNNAME].room.name, role: 'Harvester', working: false, task: null, mining: true } });
  // }
  usedNames.push(rName);
  oversee(usedNames);

  for (const name in Game.creeps) {
    const creep = Game.creeps[name];

    if (creep.memory.role === 'Harvester') {
      roleWorker(creep);
    }
  }
});

function randomName(usedName: string[]): string {
  const avalibleNames = names.filter((n: string) => !usedName.includes(n));
  return avalibleNames[Math.floor(Math.random() * (avalibleNames.length + 1))];
}

function workerBody(totalEnegry: number): BodyPartConstant[] {
  const numParts = Math.floor(totalEnegry / 200);
  console.log(`Number of Parts: ${numParts}`);
  console.log(`Total Energy: ${totalEnegry}`);
  const bodyParts: BodyPartConstant[] = [];
  for (let i = 0; i < numParts; i++) {
    bodyParts.push(WORK);
  }
  for (let i = 0; i < numParts; i++) {
    bodyParts.push(CARRY);
  }
  for (let i = 0; i < numParts; i++) {
    bodyParts.push(MOVE);
  }
  console.log(bodyParts);
  return bodyParts;

}
