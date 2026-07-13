// static circuit topologies shown in the puzzle board
// player sees the pre-built circuit and just sets the input switches
// all circuits use equivalent multi-gate implementations for visual depth

export const PUZZLE_CIRCUITS = {
  // AND via De Morgan: NOT(NOR(NOT(a), NOT(b)))
  'and-basic': [
    { id: 'a',    type: 'INPUT',  inputs: [] },
    { id: 'b',    type: 'INPUT',  inputs: [] },
    { id: 'na',   type: 'NOT',    inputs: ['a'] },
    { id: 'nb',   type: 'NOT',    inputs: ['b'] },
    { id: 'nor1', type: 'NOR',    inputs: ['na', 'nb'] },
    { id: 'out',  type: 'OUTPUT', inputs: ['nor1'] },
  ],

  // OR via De Morgan: NAND(NAND(a,a), NAND(b,b))
  'or-basic': [
    { id: 'a',    type: 'INPUT',  inputs: [] },
    { id: 'b',    type: 'INPUT',  inputs: [] },
    { id: 'na',   type: 'NAND',   inputs: ['a', 'a'] },
    { id: 'nb',   type: 'NAND',   inputs: ['b', 'b'] },
    { id: 'g1',   type: 'NAND',   inputs: ['na', 'nb'] },
    { id: 'out',  type: 'OUTPUT', inputs: ['g1'] },
  ],

  // NOT via double-stage: AND(a,a) then NOT
  'not-basic': [
    { id: 'a',   type: 'INPUT',  inputs: [] },
    { id: 'g1',  type: 'AND',    inputs: ['a', 'a'] },
    { id: 'g2',  type: 'NOT',    inputs: ['g1'] },
    { id: 'out', type: 'OUTPUT', inputs: ['g2'] },
  ],

  // XOR via all-NAND implementation (classic 4-gate circuit)
  'xor-basic': [
    { id: 'a',   type: 'INPUT',  inputs: [] },
    { id: 'b',   type: 'INPUT',  inputs: [] },
    { id: 'g1',  type: 'NAND',   inputs: ['a', 'b'] },
    { id: 'g2',  type: 'NAND',   inputs: ['a', 'g1'] },
    { id: 'g3',  type: 'NAND',   inputs: ['b', 'g1'] },
    { id: 'g4',  type: 'NAND',   inputs: ['g2', 'g3'] },
    { id: 'out', type: 'OUTPUT', inputs: ['g4'] },
  ],

  // NAND shown explicitly as AND then NOT
  'nand-basic': [
    { id: 'a',   type: 'INPUT',  inputs: [] },
    { id: 'b',   type: 'INPUT',  inputs: [] },
    { id: 'g1',  type: 'AND',    inputs: ['a', 'b'] },
    { id: 'g2',  type: 'NOT',    inputs: ['g1'] },
    { id: 'out', type: 'OUTPUT', inputs: ['g2'] },
  ],

  // NOR shown explicitly as OR then NOT
  'nor-basic': [
    { id: 'a',   type: 'INPUT',  inputs: [] },
    { id: 'b',   type: 'INPUT',  inputs: [] },
    { id: 'g1',  type: 'OR',     inputs: ['a', 'b'] },
    { id: 'g2',  type: 'NOT',    inputs: ['g1'] },
    { id: 'out', type: 'OUTPUT', inputs: ['g2'] },
  ],

  // buffer via double-NOT: NOT(NOT(a)) — makes the "just a wire" point visible
  'buffer-basic': [
    { id: 'a',   type: 'INPUT',  inputs: [] },
    { id: 'g1',  type: 'NOT',    inputs: ['a'] },
    { id: 'g2',  type: 'NOT',    inputs: ['g1'] },
    { id: 'out', type: 'OUTPUT', inputs: ['g2'] },
  ],

  // half-adder with shared NAND layer:
  //   gnand = NAND(a,b)
  //   gor   = OR(a,b)
  //   gsum  = AND(gor, gnand)  → XOR(a,b)
  //   gcar  = NOT(gnand)       → AND(a,b)
  'half-adder': [
    { id: 'a',     type: 'INPUT',  inputs: [] },
    { id: 'b',     type: 'INPUT',  inputs: [] },
    { id: 'gnand', type: 'NAND',   inputs: ['a', 'b'] },
    { id: 'gor',   type: 'OR',     inputs: ['a', 'b'] },
    { id: 'gsum',  type: 'AND',    inputs: ['gor', 'gnand'] },
    { id: 'gcar',  type: 'NOT',    inputs: ['gnand'] },
    { id: 'sum',   type: 'OUTPUT', inputs: ['gsum'] },
    { id: 'carry', type: 'OUTPUT', inputs: ['gcar'] },
  ],

  // and-or-combo: already 2 layers, keep
  'and-or-combo': [
    { id: 'a',    type: 'INPUT',  inputs: [] },
    { id: 'b',    type: 'INPUT',  inputs: [] },
    { id: 'c',    type: 'INPUT',  inputs: [] },
    { id: 'gand', type: 'AND',    inputs: ['a', 'b'] },
    { id: 'gor',  type: 'OR',     inputs: ['gand', 'c'] },
    { id: 'out',  type: 'OUTPUT', inputs: ['gor'] },
  ],

  // nand-chain: two NANDs in sequence (already 2 layers, keep)
  'nand-chain': [
    { id: 'a',     type: 'INPUT',  inputs: [] },
    { id: 'b',     type: 'INPUT',  inputs: [] },
    { id: 'nand1', type: 'NAND',   inputs: ['a', 'b'] },
    { id: 'nand2', type: 'NAND',   inputs: ['nand1', 'nand1'] },
    { id: 'out',   type: 'OUTPUT', inputs: ['nand2'] },
  ],
}
