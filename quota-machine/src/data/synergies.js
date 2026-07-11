// Connecting two machines means solving a small 2-gate "connection" puzzle
// (see the *-combo/half-adder/nand-chain puzzles in data/puzzles.js). If the
// pair is one of these 5 featured synergies, the connection bonus uses
// `multiplier` instead of DEFAULT_SYNERGY_BONUS.

export const DEFAULT_SYNERGY_BONUS = 1.1

export const FEATURED_SYNERGIES = [
  {
    machineIds: ['conveyor', 'stamper'],
    puzzleId: 'half-adder',
    multiplier: 1.5,
  },
  {
    machineIds: ['stamper', 'sorter'],
    puzzleId: 'and-or-combo',
    multiplier: 1.6,
  },
  {
    machineIds: ['inverter-rig', 'welder'],
    puzzleId: 'nand-chain',
    multiplier: 1.4,
  },
  {
    machineIds: ['sorter', 'welder'],
    puzzleId: 'and-or-combo',
    multiplier: 1.75,
  },
  {
    machineIds: ['welder', 'packager'],
    puzzleId: 'half-adder',
    multiplier: 2,
  },
]

function pairKey(idA, idB) {
  return [idA, idB].sort().join('::')
}

export function findSynergy(machineIdA, machineIdB) {
  const key = pairKey(machineIdA, machineIdB)
  return (
    FEATURED_SYNERGIES.find(
      (s) => pairKey(s.machineIds[0], s.machineIds[1]) === key
    ) || null
  )
}
