// static circuit topologies — player sees the circuit and just toggles switches
// each entry matches a puzzle id from puzzles.js

export const PUZZLE_CIRCUITS = {
  'and-basic': [
    { id: 'a',   type: 'INPUT',  inputs: [] },
    { id: 'b',   type: 'INPUT',  inputs: [] },
    { id: 'g1',  type: 'AND',    inputs: ['a', 'b'] },
    { id: 'out', type: 'OUTPUT', inputs: ['g1'] },
  ],
  'or-basic': [
    { id: 'a',   type: 'INPUT',  inputs: [] },
    { id: 'b',   type: 'INPUT',  inputs: [] },
    { id: 'g1',  type: 'OR',     inputs: ['a', 'b'] },
    { id: 'out', type: 'OUTPUT', inputs: ['g1'] },
  ],
  'not-basic': [
    { id: 'a',   type: 'INPUT',  inputs: [] },
    { id: 'g1',  type: 'NOT',    inputs: ['a'] },
    { id: 'out', type: 'OUTPUT', inputs: ['g1'] },
  ],
  'xor-basic': [
    { id: 'a',   type: 'INPUT',  inputs: [] },
    { id: 'b',   type: 'INPUT',  inputs: [] },
    { id: 'g1',  type: 'XOR',    inputs: ['a', 'b'] },
    { id: 'out', type: 'OUTPUT', inputs: ['g1'] },
  ],
  'nand-basic': [
    { id: 'a',   type: 'INPUT',  inputs: [] },
    { id: 'b',   type: 'INPUT',  inputs: [] },
    { id: 'g1',  type: 'NAND',   inputs: ['a', 'b'] },
    { id: 'out', type: 'OUTPUT', inputs: ['g1'] },
  ],
  'nor-basic': [
    { id: 'a',   type: 'INPUT',  inputs: [] },
    { id: 'b',   type: 'INPUT',  inputs: [] },
    { id: 'g1',  type: 'NOR',    inputs: ['a', 'b'] },
    { id: 'out', type: 'OUTPUT', inputs: ['g1'] },
  ],
  'buffer-basic': [
    { id: 'a',   type: 'INPUT',  inputs: [] },
    { id: 'g1',  type: 'BUFFER', inputs: ['a'] },
    { id: 'out', type: 'OUTPUT', inputs: ['g1'] },
  ],
  'half-adder': [
    { id: 'a',     type: 'INPUT',  inputs: [] },
    { id: 'b',     type: 'INPUT',  inputs: [] },
    { id: 'gxor',  type: 'XOR',    inputs: ['a', 'b'] },
    { id: 'gand',  type: 'AND',    inputs: ['a', 'b'] },
    { id: 'sum',   type: 'OUTPUT', inputs: ['gxor'] },
    { id: 'carry', type: 'OUTPUT', inputs: ['gand'] },
  ],
  'and-or-combo': [
    { id: 'a',    type: 'INPUT',  inputs: [] },
    { id: 'b',    type: 'INPUT',  inputs: [] },
    { id: 'c',    type: 'INPUT',  inputs: [] },
    { id: 'gand', type: 'AND',    inputs: ['a', 'b'] },
    { id: 'gor',  type: 'OR',     inputs: ['gand', 'c'] },
    { id: 'out',  type: 'OUTPUT', inputs: ['gor'] },
  ],
  // two NANDs chained — same truth table as AND
  'nand-chain': [
    { id: 'a',     type: 'INPUT',  inputs: [] },
    { id: 'b',     type: 'INPUT',  inputs: [] },
    { id: 'nand1', type: 'NAND',   inputs: ['a', 'b'] },
    { id: 'nand2', type: 'NAND',   inputs: ['nand1', 'nand1'] },
    { id: 'out',   type: 'OUTPUT', inputs: ['nand2'] },
  ],
}
