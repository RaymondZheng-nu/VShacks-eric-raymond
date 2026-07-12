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

// evaluates node graph and returns output booleans
export function evaluateCircuit(nodes, inputValues) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n])) // was byId
  const resolved = new Map()
  const inProgress = new Set()

  // recursively resolves node id to boolean
  function resolve(id) {
    if (resolved.has(id)) return resolved.get(id)
    const node = nodeMap.get(id)
    if (!node) throw new Error(`Circuit references unknown node "${id}"`)

    if (node.type === GATE_TYPES.INPUT) {
      if (!(id in inputValues)) throw new Error(`Missing input value for "${id}"`)
      const value = Boolean(inputValues[id])
      resolved.set(id, value)
      return value
    }

    if (inProgress.has(id)) throw new Error(`Cycle detected in circuit at node "${id}"`)
    inProgress.add(id)

    const inputIds = node.inputs || []
    if (node.type === GATE_TYPES.OUTPUT || node.type === GATE_TYPES.BUFFER) {
      if (inputIds.length !== 1) throw new Error(`${node.type} node "${id}" must have exactly 1 input`)
    } else if (node.type === GATE_TYPES.NOT) {
      if (inputIds.length !== 1) throw new Error(`NOT node "${id}" must have exactly 1 input`)
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
  // console.log('circuit outputs:', outputs)
  return outputs
}

// builds truth table spec from a boolean function msb first
export function genSpec(inputIds, outputIds, fn) {
  const rows = []
  const n = inputIds.length
  const total = 2 ** n

  for (let i = 0; i < total; i++) {
    const inputValues = {}
    inputIds.forEach((id, idx) => {
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

// runs every truth table row against the circuit
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

    const rowPassed =
      !error &&
      spec.outputIds.every((id) => actual[id] === row.expected[id])

    results.push({ inputValues: row.inputValues, expected: row.expected, actual, error, pass: rowPassed })
  }

  const failedRow = results.find((r) => !r.pass) || null
  return { pass: failedRow === null, failedRow, results }
}
