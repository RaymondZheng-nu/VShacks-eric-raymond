export const TASK_TYPES = [
  {
    id: 'wiring',
    name: 'Resolve ICD Conflict',
    description: 'Two subsystem teams disagree on the signal format at their interface. Get them to sign off on a common definition.',
    baseOutput: 2,
    staminaCost: 1,
    automationMachineId: 'conveyor',
    puzzleId: 'and-basic',
  },
  {
    id: 'stamp',
    name: 'Update RTM',
    description: 'Three new requirements came in from the customer. Trace each one to its design element in the traceability matrix.',
    baseOutput: 3,
    staminaCost: 1,
    automationMachineId: 'stamper',
    puzzleId: 'or-basic',
  },
  {
    id: 'invert',
    name: 'Flag Signal Discrepancy',
    description: 'Power team is asserting an active-low line that propulsion is treating as active-high. classic interface assumption mismatch. write it up.',
    baseOutput: 2,
    staminaCost: 1,
    automationMachineId: 'inverter-rig',
    puzzleId: 'not-basic',
  },
  {
    id: 'calibrate',
    name: 'Run Integration Test',
    description: 'First time the comms board and the flight computer are talking to each other. Log any timing violations.',
    baseOutput: 3,
    staminaCost: 1,
    automationMachineId: 'sorter',
    puzzleId: 'xor-basic',
  },
  {
    id: 'weld',
    name: 'Conduct Trade Study',
    description: 'Two competing antenna designs. Score them against mass, cost, and link margin. Pick one and document why.',
    baseOutput: 4,
    staminaCost: 1, // considered making trade studies cost 2 stamina but didn't get to it
    automationMachineId: 'welder',
    puzzleId: 'nand-basic',
  },
  {
    id: 'package',
    name: 'Write V&V Procedure',
    description: 'Document the exact test steps that will formally verify the proximity sensor shall-statement in the spec.',
    baseOutput: 4,
    staminaCost: 1,
    automationMachineId: 'packager',
    puzzleId: 'nor-basic',
  },
  // { id: 'debug', name: 'Debug Console', description: 'Check error logs.', baseOutput: 1, staminaCost: 1, automationMachineId: null },
  // removed too punishing
  {
    id: 'inspect',
    name: 'Check Spec Compliance',
    description: 'walk the cable routing against the EMI shielding spec. boring but you catch it now or you catch it at acceptance test.',
    baseOutput: 2,
    staminaCost: 1,
    automationMachineId: null, // no machine for this one yet
    puzzleId: 'buffer-basic',
  },
]

// TODO: add a task for sitting in on PDR/CDR reviews? feels very SE but maybe too niche
// returns undefined if not found
export function getTaskTypeById(id) {
  return TASK_TYPES.find((t) => t.id === id)
}
