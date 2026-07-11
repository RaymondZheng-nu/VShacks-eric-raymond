import { GATE_TYPES, genSpec } from '../engine/circuit-engine'

export const PUZZLES = [
  {
    id: 'and-basic',
    name: 'AND Gate',
    description: 'Output is on only when both inputs are on.',
    allowedGates: [GATE_TYPES.AND],
    spec: genSpec(['a', 'b'], ['out'], (a, b) => ({ out: a && b })),
  },
  {
    id: 'or-basic',
    name: 'OR Gate',
    description: 'Output is on when either input is on.',
    allowedGates: [GATE_TYPES.OR],
    spec: genSpec(['a', 'b'], ['out'], (a, b) => ({ out: a || b })),
  },
  {
    id: 'not-basic',
    name: 'NOT Gate',
    description: 'Output is the opposite of the input.',
    allowedGates: [GATE_TYPES.NOT],
    spec: genSpec(['a'], ['out'], (a) => ({ out: !a })),
  },
  {
    id: 'xor-basic',
    name: 'XOR Gate',
    description: 'Output is on when the inputs differ.',
    allowedGates: [GATE_TYPES.XOR],
    spec: genSpec(['a', 'b'], ['out'], (a, b) => ({ out: a !== b })),
  },
  {
    id: 'nand-basic',
    name: 'NAND Gate',
    description: 'Output is off only when both inputs are on.',
    allowedGates: [GATE_TYPES.NAND],
    spec: genSpec(['a', 'b'], ['out'], (a, b) => ({ out: !(a && b) })),
  },
  {
    id: 'nor-basic',
    name: 'NOR Gate',
    description: 'Output is on only when both inputs are off.',
    allowedGates: [GATE_TYPES.NOR],
    spec: genSpec(['a', 'b'], ['out'], (a, b) => ({ out: !(a || b) })),
  },
  {
    id: 'buffer-basic',
    name: 'Buffer',
    description: 'Output matches the input, unchanged.',
    allowedGates: [GATE_TYPES.BUFFER],
    spec: genSpec(['a'], ['out'], (a) => ({ out: a })),
  },
  {
    id: 'half-adder',
    name: 'Half Adder',
    description: 'Two-gate puzzle: sum = XOR, carry = AND.',
    allowedGates: [GATE_TYPES.XOR, GATE_TYPES.AND],
    spec: genSpec(['a', 'b'], ['sum', 'carry'], (a, b) => ({ sum: a !== b, carry: a && b })),
  },
  {
    id: 'and-or-combo',
    name: 'AND-OR Combo',
    description: 'Two-gate puzzle: output is on when (a AND b) OR c.',
    allowedGates: [GATE_TYPES.AND, GATE_TYPES.OR],
    spec: genSpec(['a', 'b', 'c'], ['out'], (a, b, c) => ({ out: (a && b) || c })),
  },
  {
    id: 'nand-chain',
    name: 'NAND Chain',
    description: 'Two-gate puzzle: two NANDs chained reconstruct AND behavior.',
    allowedGates: [GATE_TYPES.NAND],
    spec: genSpec(['a', 'b'], ['out'], (a, b) => ({ out: a && b })),
  },
]

// Returns the puzzle definition for the given id, or undefined.
export function getPuzzleById(id) {
  return PUZZLES.find((p) => p.id === id)
}
