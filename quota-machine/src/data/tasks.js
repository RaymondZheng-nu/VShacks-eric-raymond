export const TASK_TYPES = [
  {
    id: 'wiring',
    name: 'Fix Wiring',
    description: 'Trace the fault and reconnect the cable run.',
    baseOutput: 2,
    staminaCost: 1,
    automationMachineId: 'conveyor',
    puzzleId: 'and-basic',
  },
  {
    id: 'stamp',
    name: 'Stamp Parts',
    description: 'Run the hydraulic press for the parts order.',
    baseOutput: 3,
    staminaCost: 1,
    automationMachineId: 'stamper',
    puzzleId: 'or-basic',
  },
  {
    id: 'invert',
    name: 'Invert Signal',
    description: 'Flip the polarity on the signal chain.',
    baseOutput: 2,
    staminaCost: 1,
    automationMachineId: 'inverter-rig',
    puzzleId: 'not-basic',
  },
  {
    id: 'calibrate',
    name: 'Calibrate Sensors',
    description: 'Align the optical sensors to spec.',
    baseOutput: 3,
    staminaCost: 1,
    automationMachineId: 'sorter',
    puzzleId: 'xor-basic',
  },
  {
    id: 'weld',
    name: 'Weld Joint',
    description: 'Seal the pressure joint on the line.',
    baseOutput: 4,
    staminaCost: 1,
    automationMachineId: 'welder',
    puzzleId: 'nand-basic',
  },
  {
    id: 'package',
    name: 'Package Goods',
    description: 'Box and label the outgoing shipment.',
    baseOutput: 4,
    staminaCost: 1,
    automationMachineId: 'packager',
    puzzleId: 'nor-basic',
  },
  // { id: 'debug', name: 'Debug Console', description: 'Check error logs.', baseOutput: 1, staminaCost: 1, automationMachineId: null },
  // removed too punishing
  {
    id: 'inspect',
    name: 'Quality Inspect',
    description: 'Check products against the quality checklist.',
    baseOutput: 2,
    staminaCost: 1,
    automationMachineId: null, // no machine for this one yet
  },
]

// returns undefined if not found
export function getTaskTypeById(id) {
  return TASK_TYPES.find((t) => t.id === id)
}
