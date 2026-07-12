// baseoutput same as chips but tooltip uses it todo clean up
export const MACHINES = [
  {
    id: 'conveyor',
    name: 'Signal Processor',
    cost: 10,
    chips: 2,
    multBonus: 0,
    baseOutput: 2,
    rarity: 'common',
    artKey: 'conveyor', // artKey wasn't updated when we renamed — sprites still use old keys
    puzzleId: 'and-basic',
    repairPuzzleId: 'nand-chain',
  },
  {
    id: 'stamper',
    name: 'Requirements DB',
    cost: 15,
    chips: 4,
    multBonus: 0,
    baseOutput: 4,
    rarity: 'common',
    artKey: 'stamper',
    puzzleId: 'or-basic',
    repairPuzzleId: 'and-or-combo',
  },
  {
    id: 'inverter-rig',
    name: 'Interface Controller',
    cost: 12,
    baseOutput: 0,
    chips: 0, // pure mult machine, no chips — only one like this
    multBonus: 2,
    rarity: 'uncommon',
    artKey: 'inverter-rig',
    puzzleId: 'not-basic',
    repairPuzzleId: 'half-adder',
  },
  {
    id: 'sorter',
    name: 'Test Harness',
    cost: 20,
    chips: 6,
    multBonus: 0,
    baseOutput: 6,
    rarity: 'uncommon',
    artKey: 'sorter',
    puzzleId: 'xor-basic',
    repairPuzzleId: 'half-adder',
  },
  {
    id: 'welder',
    name: 'Trade Analyzer',
    cost: 25,
    chips: 4,
    multBonus: 2,
    baseOutput: 4,
    rarity: 'rare',
    artKey: 'welder',
    puzzleId: 'nand-basic',
    repairPuzzleId: 'and-or-combo',
  },
  {
    id: 'packager',
    name: 'Verification Suite',
    cost: 30, // same as welder intentional
    chips: 8,
    multBonus: 0,
    baseOutput: 8,
    rarity: 'common',
    artKey: 'packager',
    puzzleId: 'nor-basic',
    repairPuzzleId: 'nand-chain',
  },
]

// just Array.find, nothing exciting
export function getMachineById(id) {
  return MACHINES.find((m) => m.id === id)
}
