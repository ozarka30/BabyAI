// example declaration file - remove these and add your own custom typings

// memory extension samples
interface CreepMemory {
  role: string;
  room: string;
  working: boolean;
  mining: boolean;
  task: Task | null;
  _trav?: TravelData | {};
}

interface Memory {
  uuid: number;
  log: any;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}

interface RoomMemory {
  avoid: number;
}

interface OverseerMemory {
  taskList: Task[];
  needEnergy: string[];
  toBuild: string[];
  toRepair: string[];
}

interface SpawnMemory {
  name: string;
  overseerMemory?: OverseerMemory;
}

interface Task {
  type: string;
  item: string;
  emojii: string;
  assigned: string | null;
}
