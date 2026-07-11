// Pure digital-logic circuit evaluator. No DOM / React dependency so it can
// be unit tested and reused for both the puzzle validator and any future
// machine-synergy circuit checks.

export const GATE_TYPES = {
  INPUT: 'INPUT',
  OUTPUT: 'OUTPUT',
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  XOR: 'XOR',
  NAND: 'NAND',
  NOR: 'NOR',
  BUFFER: 'BUFFER',
}

const GATE_FNS = {
  AND: (ins) => ins.every(Boolean),
  OR: (ins) => ins.some(Boolean),
  NOT: (ins) => !ins[0],
  XOR: (ins) => ins.filter(Boolean).length % 2 === 1,
  NAND: (ins) => !ins.every(Boolean),
  NOR: (ins) => !ins.some(Boolean),
  BUFFER: (ins) => Boolean(ins[0]),
}

/**
 * A node looks like:
 *   { id: 'g1', type: 'AND', inputs: ['a', 'b'] }        // gate
 *   { id: 'a', type: 'INPUT' }                            // input pin
 *   { id: 'out', type: 'OUTPUT', inputs: ['g1'] }          // output pin
 *
 * `inputs` holds node ids that feed this node. INPUT nodes take their
 * value from `inputValues` instead.
 */
export function evaluateCircuit(nodes, inputValues) {
  const byId = new Map(nodes.map((n) => [n.id, n]))

  const resolved = new Map()
  const inProgress = new Set()

  function resolve(id) {
    if (resolved.has(id)) return resolved.get(id)
    const node = byId.get(id)
    if (!node) {
      throw new Error(`Circuit references unknown node "${id}"`)
    }

    if (node.type === GATE_TYPES.INPUT) {
      if (!(id in inputValues)) {
        throw new Error(`Missing input value for "${id}"`)
      }
      const value = Boolean(inputValues[id])
      resolved.set(id, value)
      return value
    }

    if (inProgress.has(id)) {
      throw new Error(`Cycle detected in circuit at node "${id}"`)
    }
    inProgress.add(id)

    const inputIds = node.inputs || []
    if (node.type === GATE_TYPES.OUTPUT || node.type === GATE_TYPES.BUFFER) {
      if (inputIds.length !== 1) {
        throw new Error(`${node.type} node "${id}" must have exactly 1 input`)
      }
    } else if (node.type === GATE_TYPES.NOT) {
      if (inputIds.length !== 1) {
        throw new Error(`NOT node "${id}" must have exactly 1 input`)
      }
    } else if (inputIds.length < 2) {
      throw new Error(`${node.type} node "${id}" needs at least 2 inputs`)
    }

    const inputVals = inputIds.map(resolve)

    let value
    if (node.type === GATE_TYPES.OUTPUT) {
      value = inputVals[0]
    } else {
      const fn = GATE_FNS[node.type]
      if (!fn) throw new Error(`Unknown gate type "${node.type}"`)
      value = fn(inputVals)
    }

    inProgress.delete(id)
    resolved.set(id, value)
    return value
  }

  const outputs = {}
  for (const node of nodes) {
    if (node.type === GATE_TYPES.OUTPUT) {
      outputs[node.id] = resolve(node.id)
    }
  }
  return outputs
}

/**
 * Builds a full truth-table spec from a plain boolean function so puzzle
 * authoring is a one-liner, e.g.:
 *   genSpec(['a', 'b'], ['sum'], (a, b) => ({ sum: a !== b }))
 */
export function genSpec(inputIds, outputIds, fn) {
  const rows = []
  const n = inputIds.length
  const total = 2 ** n

  for (let i = 0; i < total; i++) {
    const inputValues = {}
    inputIds.forEach((id, idx) => {
      // Most significant input bit first.
      inputValues[id] = Boolean((i >> (n - idx - 1)) & 1)
    })

    const result = fn(...inputIds.map((id) => inputValues[id]))
    const expected = {}
    outputIds.forEach((id) => {
      expected[id] = Boolean(result[id])
    })

    rows.push({ inputValues, expected })
  }

  return { inputIds, outputIds, rows }
}

/**
 * Runs every row of `spec`'s truth table against the player's circuit
 * (`nodes`). Returns { pass, failedRow, results } so the UI can show
 * exactly which input combination failed.
 */
export function validateCircuit(nodes, spec) {
  const results = []

  for (const row of spec.rows) {
    let actual
    let error = null
    try {
      actual = evaluateCircuit(nodes, row.inputValues)
    } catch (err) {
      error = err.message
      actual = null
    }

    const pass =
      !error &&
      spec.outputIds.every((id) => actual[id] === row.expected[id])

    results.push({
      inputValues: row.inputValues,
      expected: row.expected,
      actual,
      error,
      pass,
    })
  }

  const failedRow = results.find((r) => !r.pass) || null

  return {
    pass: failedRow === null,
    failedRow,
    results,
  }
}
