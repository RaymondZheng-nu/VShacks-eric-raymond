// 6 hardcoded machines available in the shop. `puzzleId` points at the
// puzzle (see data/puzzles.js) the player must solve to bring the machine
// online, and re-solve when it randomly fails.

export const MACHINES = [
  {
    id: 'conveyor',
    name: 'Conveyor Feeder',
    cost: 10,
    baseOutput: 1,
    artKey: 'conveyor',
    puzzleId: 'and-basic',
  },
  {
    id: 'stamper',
    name: 'Hydraulic Stamper',
    cost: 15,
    baseOutput: 2,
    artKey: 'stamper',
    puzzleId: 'or-basic',
  },
  {
    id: 'inverter-rig',
    name: 'Inverter Rig',
    cost: 12,
    baseOutput: 1,
    artKey: 'inverter-rig',
    puzzleId: 'not-basic',
  },
  {
    id: 'sorter',
    name: 'Optical Sorter',
    cost: 20,
    baseOutput: 3,
    artKey: 'sorter',
    puzzleId: 'xor-basic',
  },
  {
    id: 'welder',
    name: 'Robotic Welder',
    cost: 25,
    baseOutput: 3,
    artKey: 'welder',
    puzzleId: 'nand-basic',
  },
  {
    id: 'packager',
    name: 'Auto Packager',
    cost: 30,
    baseOutput: 4,
    artKey: 'packager',
    puzzleId: 'nor-basic',
  },
]

export function getMachineById(id) {
  return MACHINES.find((m) => m.id === id)
}
