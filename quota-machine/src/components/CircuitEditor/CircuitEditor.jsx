import { useState, useEffect, useRef } from 'react'
import Grid from './Grid.jsx'
import { validateCircuit, GATE_TYPES } from '../../engine/circuit-engine.js'
import { spendStamina } from '../../game/turn.js'

// Returns the starting input/output nodes for a puzzle with no gates placed yet.
function buildInitialNodes(puzzle) {
  const inputNodes = puzzle.spec.inputIds.map((id) => ({ id, type: GATE_TYPES.INPUT }))
  const outputNodes = puzzle.spec.outputIds.map((id) => ({ id, type: GATE_TYPES.OUTPUT, inputs: [] }))
  return [...inputNodes, ...outputNodes]
}

// Modal circuit builder: lets the player wire gates to satisfy a puzzle's truth table.
export default function CircuitEditor({ puzzle, isRepair, gameState, setGameState, onSolved, onCancel }) {
  const [nodes, setNodes] = useState(() => buildInitialNodes(puzzle))
  const [pendingSource, setPendingSource] = useState(null)
  const [result, setResult] = useState(null)
  const gateCounter = useRef(0) // ref not state so adding gates doesnt rerender everything

  useEffect(() => {
    setNodes(buildInitialNodes(puzzle))
    setPendingSource(null)
    setResult(null)
    gateCounter.current = 0
  }, [puzzle.id])

  // old approach was storing gates separately from wires, merged them into nodes
  // Adds a new gate node of the given type to the canvas.
  function addGate(type) {
    gateCounter.current += 1
    const id = `gate-${type.toLowerCase()}-${gateCounter.current}`
    setNodes((prev) => [...prev, { id, type, inputs: [] }])
  }

  // Handles a node click: starts a wire from a source or completes a wire to a target.
  function handleSelectNode(node) {
    if (pendingSource === null) {
      if (node.type === GATE_TYPES.OUTPUT) return
      setPendingSource(node.id)
      return
    }

    if (pendingSource === node.id) {
      setPendingSource(null)
      return
    }

    if (node.type === GATE_TYPES.INPUT) {
      setPendingSource(null)
      return
    }

    setNodes((prev) =>
      prev.map((n) =>
        n.id === node.id ? { ...n, inputs: [...(n.inputs || []), pendingSource] } : n
      )
    )
    setPendingSource(null)
  }

  // Removes the wire at the given index from a node's inputs array.
  function clearWire(nodeId, wireIndex) {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId ? { ...n, inputs: n.inputs.filter((_, i) => i !== wireIndex) } : n
      )
    )
  }

  // Validates the circuit; on pass spends 1 stamina and calls onSolved.
  function handleCheck() {
    if (gameState.stamina <= 0) {
      setResult({ pass: false, message: 'Out of stamina — wait for next turn.' })
      return
    }

    const validation = validateCircuit(nodes, puzzle.spec)
    if (!validation.pass) {
      setResult({ pass: false, validation })
      return
    }

    // stamina gets checked twice (here + inside spendStamina) but w/e
    const spend = spendStamina(gameState)
    if (!spend.ok) {
      setResult({ pass: false, message: 'Out of stamina — wait for next turn.' })
      return
    }

    setGameState(spend.state)
    setResult({ pass: true, validation })
    onSolved()
  }

  return (
    <div className="circuit-editor">
      <h2>{isRepair ? '⚠ REPAIR: ' : 'INSTALL: '}{puzzle?.name ?? 'Circuit Puzzle'}</h2>
      <p>{puzzle?.description}</p>

      <div className="circuit-editor-palette">
        {puzzle.allowedGates.map((type) => (
          <button key={type} className="palette-btn" onClick={() => addGate(type)}>
            <img
              src={`/quota-machine/sprites/circuits/${type}.png`}
              alt={type}
              className="palette-sprite"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            {type}
          </button>
        ))}
      </div>

      <Grid
        puzzle={puzzle}
        nodes={nodes}
        pendingSource={pendingSource}
        onSelectNode={handleSelectNode}
        onClearWire={clearWire}
      />

      <div className="circuit-editor-actions">
        <button onClick={handleCheck}>Check Circuit</button>
        <button onClick={onCancel}>Cancel</button>
      </div>

      {result && (
        <div className={`circuit-result circuit-result--${result.pass ? 'pass' : 'fail'}`}>
          {result.pass && <p>PASS</p>}
          {!result.pass && result.message && <p>{result.message}</p>}
          {!result.pass && result.validation && (
            <>
              <p>FAIL</p>
              {result.validation.failedRow && (
                <p>
                  Failed on inputs {JSON.stringify(result.validation.failedRow.inputValues)} —
                  expected {JSON.stringify(result.validation.failedRow.expected)}, got{' '}
                  {result.validation.failedRow.error ?? JSON.stringify(result.validation.failedRow.actual)}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
