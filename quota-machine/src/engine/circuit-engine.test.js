import { describe, it, expect } from 'vitest'
import { evaluateCircuit, genSpec, validateCircuit } from './circuit-engine'

describe('evaluateCircuit', () => {
  it('evaluates a simple AND gate', () => {
    const nodes = [
      { id: 'a', type: 'INPUT' },
      { id: 'b', type: 'INPUT' },
      { id: 'g1', type: 'AND', inputs: ['a', 'b'] },
      { id: 'out', type: 'OUTPUT', inputs: ['g1'] },
    ]
    expect(evaluateCircuit(nodes, { a: true, b: true })).toEqual({ out: true })
    expect(evaluateCircuit(nodes, { a: true, b: false })).toEqual({ out: false })
  })

  it('evaluates a half-adder (sum = XOR, carry = AND)', () => {
    const nodes = [
      { id: 'a', type: 'INPUT' },
      { id: 'b', type: 'INPUT' },
      { id: 'sumGate', type: 'XOR', inputs: ['a', 'b'] },
      { id: 'carryGate', type: 'AND', inputs: ['a', 'b'] },
      { id: 'sum', type: 'OUTPUT', inputs: ['sumGate'] },
      { id: 'carry', type: 'OUTPUT', inputs: ['carryGate'] },
    ]

    expect(evaluateCircuit(nodes, { a: false, b: false })).toEqual({ sum: false, carry: false })
    expect(evaluateCircuit(nodes, { a: true, b: false })).toEqual({ sum: true, carry: false })
    expect(evaluateCircuit(nodes, { a: true, b: true })).toEqual({ sum: false, carry: true })
  })

  it('throws on a cycle', () => {
    const nodes = [
      { id: 'a', type: 'INPUT' },
      { id: 'g1', type: 'AND', inputs: ['a', 'g2'] },
      { id: 'g2', type: 'NOT', inputs: ['g1'] },
      { id: 'out', type: 'OUTPUT', inputs: ['g2'] },
    ]
    expect(() => evaluateCircuit(nodes, { a: true })).toThrow(/Cycle detected/)
  })

  it('throws on a missing input value', () => {
    const nodes = [
      { id: 'a', type: 'INPUT' },
      { id: 'out', type: 'OUTPUT', inputs: ['a'] },
    ]
    expect(() => evaluateCircuit(nodes, {})).toThrow(/Missing input value/)
  })
})

describe('genSpec', () => {
  it('builds a full truth table for a 2-input function', () => {
    const spec = genSpec(['a', 'b'], ['out'], (a, b) => ({ out: a && b }))
    expect(spec.rows).toHaveLength(4)
    expect(spec.rows[0]).toEqual({
      inputValues: { a: false, b: false },
      expected: { out: false },
    })
    expect(spec.rows[3]).toEqual({
      inputValues: { a: true, b: true },
      expected: { out: true },
    })
  })
})

describe('validateCircuit', () => {
  it('passes a correct AND circuit against an AND spec', () => {
    const spec = genSpec(['a', 'b'], ['out'], (a, b) => ({ out: a && b }))
    const nodes = [
      { id: 'a', type: 'INPUT' },
      { id: 'b', type: 'INPUT' },
      { id: 'g1', type: 'AND', inputs: ['a', 'b'] },
      { id: 'out', type: 'OUTPUT', inputs: ['g1'] },
    ]
    const result = validateCircuit(nodes, spec)
    expect(result.pass).toBe(true)
    expect(result.failedRow).toBeNull()
    expect(result.results).toHaveLength(4)
  })

  it('reports the first failing row for a deliberately wrong circuit (OR instead of AND)', () => {
    const spec = genSpec(['a', 'b'], ['out'], (a, b) => ({ out: a && b }))
    const nodes = [
      { id: 'a', type: 'INPUT' },
      { id: 'b', type: 'INPUT' },
      { id: 'g1', type: 'OR', inputs: ['a', 'b'] },
      { id: 'out', type: 'OUTPUT', inputs: ['g1'] },
    ]
    const result = validateCircuit(nodes, spec)
    expect(result.pass).toBe(false)
    expect(result.failedRow).not.toBeNull()
    expect(result.failedRow.inputValues).toEqual({ a: false, b: true })
    expect(result.failedRow.actual).toEqual({ out: true })
    expect(result.failedRow.expected).toEqual({ out: false })
  })
})
