import { GATE_TYPES, genSpec } from '../engine/circuit-engine'

export const PUZZLES = [
  {
    id: 'and-basic',
    name: 'Hardware Interlock',
    description: 'Both inputs must be asserted. Bread and butter of hardware design.',
    allowedGates: [GATE_TYPES.AND],
    spec: genSpec(['a', 'b'], ['out'], (a, b) => ({ out: a && b })),
  },
  {
    id: 'or-basic',
    name: 'Redundant Signal Path',
    description: 'Output fires if either the primary or backup signal line is live. Either path is sufficient.',
    allowedGates: [GATE_TYPES.OR],
    spec: genSpec(['a', 'b'], ['out'], (a, b) => ({ out: a || b })),
  },
  {
    id: 'not-basic',
    name: 'Active-Low Enable',
    description: 'Active-low enable. Output is on when the pin is NOT asserted. Yes this is intentionally backwards.',
    allowedGates: [GATE_TYPES.NOT],
    spec: genSpec(['a'], ['out'], (a) => ({ out: !a })),
  },
  {
    id: 'xor-basic',
    name: 'Disagreement Detector',
    description: 'Two redundant sensors feed in. Flag when they disagree — either one stuck high or one stuck low.',
    allowedGates: [GATE_TYPES.XOR],
    spec: genSpec(['a', 'b'], ['out'], (a, b) => ({ out: a !== b })),
  },
  {
    id: 'nand-basic',
    name: 'Fail-Safe Gate',
    description: 'Output stays enabled unless both lockout conditions are simultaneously raised. Fails open.',
    allowedGates: [GATE_TYPES.NAND],
    spec: genSpec(['a', 'b'], ['out'], (a, b) => ({ out: !(a && b) })),
  },
  {
    id: 'nor-basic',
    name: 'All-Clear Detector',
    description: 'System enables only when all fault lines are clear. Any single fault inhibits the output.',
    allowedGates: [GATE_TYPES.NOR],
    spec: genSpec(['a', 'b'], ['out'], (a, b) => ({ out: !(a || b) })),
  },
  { // people always overthink this one — it's just a wire
    id: 'buffer-basic',
    name: 'Signal Isolator',
    description: 'Passes the signal through unchanged. Used to isolate load from source and prevent back-driving.',
    allowedGates: [GATE_TYPES.BUFFER],
    spec: genSpec(['a'], ['out'], (a) => ({ out: a })),
  },
  { // this one always trips people up
    id: 'half-adder',
    name: 'Half Adder',
    description: 'Produces a sum bit and a carry bit from two inputs. Core building block of every ALU.',
    allowedGates: [GATE_TYPES.XOR, GATE_TYPES.AND],
    spec: genSpec(['a', 'b'], ['sum', 'carry'], (a, b) => ({ sum: a !== b, carry: a && b })),
  },
  { // used to be called 'Override Circuit' before we added the third input
    id: 'and-or-combo',
    name: 'Priority Override',
    description: 'Normal enable requires A AND B. Emergency override C bypasses the interlock entirely.',
    allowedGates: [GATE_TYPES.AND, GATE_TYPES.OR],
    spec: genSpec(['a', 'b', 'c'], ['out'], (a, b, c) => ({ out: (a && b) || c })),
  },
  {
    id: 'nand-chain',
    name: 'NAND Reuse',
    description: 'Two NANDs chained give AND behavior. Same truth table as Hardware Interlock but you\'re stuck with NANDs.',
    allowedGates: [GATE_TYPES.NAND],
    spec: genSpec(['a', 'b'], ['out'], (a, b) => ({ out: a && b })),
  },
]

// returns undefined if missing
export function getPuzzleById(id) {
  return PUZZLES.find((p) => p.id === id)
}
