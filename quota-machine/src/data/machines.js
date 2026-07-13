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
    // real on/off art, added late so double check these paths if the shelf ever moves
    spriteOn: `${import.meta.env.BASE_URL}sprites/machines/signal_processor_machine.png`,
    spriteOff: `${import.meta.env.BASE_URL}sprites/machines/signal_processor_machine_off.png`,
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
    spriteOn: `${import.meta.env.BASE_URL}sprites/machines/RequirementsDB_machine.png`,
    spriteOff: `${import.meta.env.BASE_URL}sprites/machines/RequirementsDB_machine_off.png`,
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
    spriteOn: `${import.meta.env.BASE_URL}sprites/machines/interface_controller_machine.png`,
    spriteOff: `${import.meta.env.BASE_URL}sprites/machines/interface_controller_machine_off.png`,
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
    spriteOn: `${import.meta.env.BASE_URL}sprites/machines/test_harness_machine.png`,
    spriteOff: `${import.meta.env.BASE_URL}sprites/machines/test_harness_machine_off.png`,
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
    spriteOn: `${import.meta.env.BASE_URL}sprites/machines/trade_analyzer_machine.png`,
    spriteOff: `${import.meta.env.BASE_URL}sprites/machines/trade_analyzer_machine_off.png`,
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
    spriteOn: `${import.meta.env.BASE_URL}sprites/machines/verification_suite_machine.png`,
    spriteOff: `${import.meta.env.BASE_URL}sprites/machines/verification_suite_machine_off.png`,
  },
  {
    id: 'stack-processor',
    name: 'Stack Processor',
    cost: 22,
    chips: 3,
    multBonus: 0,
    baseOutput: 3,
    rarity: 'uncommon',
    artKey: 'stack-processor',
    countScaling: true, // chips output multiplies by how many are online
    puzzleId: 'buffer-basic',
    repairPuzzleId: 'and-or-combo',
    // TODO: get actual sprites for these two
    spriteOn: `${import.meta.env.BASE_URL}sprites/machines/generic.png`,
    spriteOff: `${import.meta.env.BASE_URL}sprites/machines/generic.png`,
  },
  {
    id: 'cascade-engine',
    name: 'Cascade Engine',
    cost: 32,
    chips: 0,
    multBonus: 1,
    baseOutput: 0,
    rarity: 'rare',
    artKey: 'cascade-engine',
    countScaling: true, // same deal but for mult
    puzzleId: 'nand-chain',
    repairPuzzleId: 'half-adder',
    spriteOn: `${import.meta.env.BASE_URL}sprites/machines/generic.png`,
    spriteOff: `${import.meta.env.BASE_URL}sprites/machines/generic.png`,
  },
  // cut: load balancer machine (redistributes chips between machines)
  // was going to be a debuff-negation type thing but ran out of time
]

// just Array.find, nothing exciting
export function getMachineById(id) {
  return MACHINES.find((m) => m.id === id)
}
