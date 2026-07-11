export const DEFAULT_SYNERGY_BONUS = 1.1

export const FEATURED_SYNERGIES = [
  { machineIds: ['conveyor', 'stamper'], puzzleId: 'half-adder', multiplier: 1.5 },
  { machineIds: ['stamper', 'sorter'], puzzleId: 'and-or-combo', multiplier: 1.6 },
  { machineIds: ['inverter-rig', 'welder'], puzzleId: 'nand-chain', multiplier: 1.4 },
  { machineIds: ['sorter', 'welder'], puzzleId: 'and-or-combo', multiplier: 1.75 },
  { machineIds: ['welder', 'packager'], puzzleId: 'half-adder', multiplier: 2 },
]

// Returns a stable sort key for a pair of machine ids.
function pairKey(idA, idB) {
  return [idA, idB].sort().join('::')
}

// Returns the featured synergy for a pair of machine ids, or null.
export function findSynergy(machineIdA, machineIdB) {
  const key = pairKey(machineIdA, machineIdB)
  return FEATURED_SYNERGIES.find((s) => pairKey(s.machineIds[0], s.machineIds[1]) === key) || null
}
