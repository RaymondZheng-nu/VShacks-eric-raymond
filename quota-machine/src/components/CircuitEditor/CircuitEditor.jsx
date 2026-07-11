import { useState, useEffect, useRef } from 'react'
import Grid from './Grid.jsx'
import { validateCircuit, GATE_TYPES } from '../../engine/circuit-engine.js'
import { spendStamina } from '../../game/turn.js'

function buildInitialNodes(puzzle) {
  const inputNodes = puzzle.spec.inputIds.map((id) => ({ id, type: GATE_TYPES.INPUT }))
  const outputNodes = puzzle.spec.outputIds.map((id) => ({ id, type: GATE_TYPES.OUTPUT, inputs: [] }))
  return [...inputNodes, ...outputNodes]
}

export default function CircuitEditor({ puzzle, gameState, setGameState, onSolved, onCancel }) {
  const [nodes, setNodes] = useState(() => buildInitialNodes(puzzle))
  const [pendingSource, setPendingSource] = useState(null)
  const [result, setResult] = useState(null)
  const gateCounter = useRef(0)

  useEffect(() => {
    setNodes(buildInitialNodes(puzzle))
    setPendingSource(null)
    setResult(null)
    gateCounter.current = 0
  }, [puzzle.id])

  function addGate(type) {
    gateCounter.current += 1
    const id = `gate-${type.toLowerCase()}-${gateCounter.current}`
    setNodes((prev) => [...prev, { id, type, inputs: [] }])
  }

  function handleSelectNode(node) {
    if (pendingSource === null) {
      if (node.type === GATE_TYPES.OUTPUT) return // outputs are targets only
      setPendingSource(node.id)
      return
    }

    if (pendingSource === node.id) {
      setPendingSource(null) // click same node again to cancel
      return
    }

    if (node.type === GATE_TYPES.INPUT) {
      setPendingSource(null) // inputs can't receive a wire
      return
    }

    setNodes((prev) =>
      prev.map((n) =>
        n.id === node.id ? { ...n, inputs: [...(n.inputs || []), pendingSource] } : n
      )
    )
    setPendingSource(null)
  }

  function clearWire(nodeId, wireIndex) {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId ? { ...n, inputs: n.inputs.filter((_, i) => i !== wireIndex) } : n
      )
    )
  }

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
      <h2>{puzzle?.name ?? 'Circuit Puzzle'}</h2>
      <p>{puzzle?.description}</p>

      <div className="circuit-editor-palette">
        {puzzle.allowedGates.map((type) => (
          <button key={type} onClick={() => addGate(type)}>+ {type}</button>
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
