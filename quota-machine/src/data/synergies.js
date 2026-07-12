export const DEFAULT_SYNERGY_BONUS = 1.1

export const FEATURED_SYNERGIES = [
  { machineIds: ['conveyor', 'stamper'], puzzleId: 'half-adder', multiplier: 1.5 },
  { machineIds: ['stamper', 'sorter'], puzzleId: 'and-or-combo', multiplier: 1.6 },
  { machineIds: ['inverter-rig', 'welder'], puzzleId: 'nand-chain', multiplier: 1.4 },
  { machineIds: ['sorter', 'welder'], puzzleId: 'and-or-combo', multiplier: 1.75 },
  { machineIds: ['welder', 'packager'], puzzleId: 'half-adder', multiplier: 2 }, // 2.0 might be busted keeping it for now
]

function pairKey(a, b) {
  return [a, b].sort().join('::')
}

// look up synergy by pair order doesnt matter
export function findSynergy(machineIdA, machineIdB) {
  const key = pairKey(machineIdA, machineIdB)
  return FEATURED_SYNERGIES.find((s) => pairKey(s.machineIds[0], s.machineIds[1]) === key) || null
}
