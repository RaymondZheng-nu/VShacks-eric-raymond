import { useState, useMemo } from 'react'
import { evaluateCircuit } from '../engine/circuit-engine'
import { PUZZLE_CIRCUITS } from '../data/puzzleCircuits'
import { spendStamina } from '../game/turn'

const BASE = `${import.meta.env.BASE_URL}sprites/circuits`
const GATE_SPRITE = {
  AND:    `${BASE}/AND.png`,
  OR:     `${BASE}/OR.png`,
  NOT:    `${BASE}/NOT.png`,
  XOR:    `${BASE}/XOR.png`,
  NAND:   `${BASE}/NAND.png`,
  NOR:    `${BASE}/NOR.png`,
  BUFFER: `${BASE}/resistor.png`,
}

const VW = 500

// computes pixel positions for every node in the circuit
// inputs spread on left, outputs on right, gates in between by dependency layer
function layoutNodes(nodes) {
  const inputNodes  = nodes.filter(n => n.type === 'INPUT')
  const outputNodes = nodes.filter(n => n.type === 'OUTPUT')
  const gateNodes   = nodes.filter(n => n.type !== 'INPUT' && n.type !== 'OUTPUT')

  const rows = Math.max(inputNodes.length, outputNodes.length, 1)
  const VH   = Math.max(rows * 90 + 40, 160)

  const pos = {}

  inputNodes.forEach((n, i) => {
    pos[n.id] = { x: 65, y: VH / (inputNodes.length + 1) * (i + 1) }
  })

  // topological layer for each node
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const layerOf = {}
  function getLayer(id) {
    if (layerOf[id] !== undefined) return layerOf[id]
    const n = nodeMap.get(id)
    if (!n || n.type === 'INPUT') { layerOf[id] = 0; return 0 }
    const l = n.inputs.length ? Math.max(...n.inputs.map(getLayer)) + 1 : 1
    layerOf[id] = l
    return l
  }
  nodes.forEach(n => getLayer(n.id))

  const maxGateLayer = gateNodes.length ? Math.max(...gateNodes.map(n => layerOf[n.id])) : 0
  const xGate = (layer) => 65 + (layer / (maxGateLayer + 1)) * (VW - 130)

  // gates in topological order so each gate can reference already-computed input positions
  const ordered = [...gateNodes].sort((a, b) => layerOf[a.id] - layerOf[b.id])
  ordered.forEach(n => {
    const ys = n.inputs.map(id => pos[id]?.y ?? VH / 2)
    pos[n.id] = {
      x: xGate(layerOf[n.id]),
      y: ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : VH / 2,
    }
  })

  // outputs align with their source gate
  outputNodes.forEach((n, i) => {
    const srcY = n.inputs.length && pos[n.inputs[0]] != null
      ? pos[n.inputs[0]].y
      : VH / (outputNodes.length + 1) * (i + 1)
    pos[n.id] = { x: VW - 65, y: srcY }
  })

  return { pos, VH }
}

// smooth bezier wire path between two points
function wirePath(a, b) {
  const mx = (a.x + b.x) / 2
  return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`
}

export default function PuzzleBoard({ puzzle, isRepair, gameState, setGameState, onSolved, onCancel }) {
  const staticNodes = PUZZLE_CIRCUITS[puzzle.id]

  const [targetRow] = useState(() => {
    const rows = puzzle.spec.rows
    return rows[Math.floor(Math.random() * rows.length)]
  })

  const [inputValues, setInputValues] = useState(() =>
    Object.fromEntries(puzzle.spec.inputIds.map(id => [id, false]))
  )

  const outputs = useMemo(() => {
    if (!staticNodes) return null
    try { return evaluateCircuit(staticNodes, inputValues) }
    catch { return null }
  }, [staticNodes, inputValues])

  const isCorrect = outputs != null &&
    puzzle.spec.outputIds.every(id => outputs[id] === targetRow.expected[id])

  function toggleInput(id) {
    setInputValues(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function handleConfirm() {
    if (!isCorrect || gameState.stamina <= 0) return
    const spend = spendStamina(gameState)
    if (!spend.ok) return
    setGameState(spend.state)
    onSolved()
  }

  if (!staticNodes) {
    return (
      <div className="pboard">
        <p style={{ color: '#f87171' }}>No circuit defined for puzzle: {puzzle.id}</p>
        <button onClick={onCancel}>Cancel</button>
      </div>
    )
  }

  const { pos, VH } = layoutNodes(staticNodes)
  const gateNodes = staticNodes.filter(n => n.type !== 'INPUT' && n.type !== 'OUTPUT')

  // collect all wire segments
  const wires = []
  staticNodes.forEach(node => {
    if (node.type === 'INPUT') return
    ;(node.inputs || []).forEach(srcId => {
      const a = pos[srcId]
      const b = pos[node.id]
      if (a && b) wires.push({ d: wirePath(a, b), key: `${srcId}-${node.id}` })
    })
  })

  const noStamina = gameState.stamina <= 0

  return (
    <div className="pboard">
      <div className="pboard-header">
        <h2>{isRepair ? '⚠ REPAIR' : 'INSTALL'}: {puzzle.name}</h2>
        <p className="pboard-desc">{puzzle.description}</p>
      </div>

      <div className="pboard-target">
        <span className="pboard-target-label">Target output</span>
        <div className="pboard-target-vals">
          {puzzle.spec.outputIds.map(id => (
            <span key={id} className={`pboard-target-val pboard-target-val--${targetRow.expected[id] ? 'on' : 'off'}`}>
              {id} = {targetRow.expected[id] ? 'ON' : 'OFF'}
            </span>
          ))}
        </div>
      </div>

      {/* circuit diagram */}
      <div className="pboard-diagram" style={{ paddingBottom: `${(VH / VW) * 100}%` }}>
        <div className="pboard-diagram-inner">
          {/* SVG wire overlay */}
          <svg className="pboard-wires" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet">
            {wires.map(w => (
              <path key={w.key} d={w.d} className="pboard-wire" />
            ))}
          </svg>

          {/* input switches */}
          {puzzle.spec.inputIds.map(id => {
            const p = pos[id]
            const on = inputValues[id]
            return (
              <button
                key={id}
                className={`pboard-node pboard-switch ${on ? 'pboard-switch--on' : ''}`}
                style={{ left: `${(p.x / VW) * 100}%`, top: `${(p.y / VH) * 100}%` }}
                onClick={() => toggleInput(id)}
                title={`Click to toggle ${id.toUpperCase()}`}
              >
                <img
                  src={`${BASE}/${on ? 'switch-closed' : 'switch-open'}.png`}
                  alt={on ? 'closed' : 'open'}
                  className="pboard-sprite"
                />
                <span className="pboard-node-id">{id.toUpperCase()}</span>
                <span className={`pboard-node-val ${on ? 'on' : 'off'}`}>{on ? '1' : '0'}</span>
              </button>
            )
          })}

          {/* gates */}
          {gateNodes.map(node => {
            const p = pos[node.id]
            const sprite = GATE_SPRITE[node.type]
            return (
              <div
                key={node.id}
                className="pboard-node pboard-gate"
                style={{ left: `${(p.x / VW) * 100}%`, top: `${(p.y / VH) * 100}%` }}
              >
                {sprite && <img src={sprite} alt={node.type} className="pboard-sprite pboard-gate-sprite" />}
                <span className="pboard-node-id">{node.type}</span>
              </div>
            )
          })}

          {/* outputs */}
          {puzzle.spec.outputIds.map(id => {
            const p = pos[id]
            const on = outputs?.[id]
            const matchesTarget = on === targetRow.expected[id]
            return (
              <div
                key={id}
                className={`pboard-node pboard-output ${on ? 'pboard-output--on' : ''} ${matchesTarget ? 'pboard-output--match' : ''}`}
                style={{ left: `${(p.x / VW) * 100}%`, top: `${(p.y / VH) * 100}%` }}
              >
                <img
                  src={`${BASE}/DC.png`}
                  alt={id}
                  className="pboard-sprite pboard-output-sprite"
                  style={{ opacity: on ? 1 : 0.2 }}
                />
                <span className="pboard-node-id">{id}</span>
                <span className={`pboard-node-val ${on ? 'on' : 'off'}`}>{on ? '1' : '0'}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className={`pboard-status ${isCorrect ? 'pboard-status--ok' : 'pboard-status--bad'}`}>
        {noStamina
          ? 'No stamina — end turn to restore'
          : isCorrect
            ? '✓ Output matches target — confirm to complete'
            : '✗ Adjust switches until the output matches the target'}
      </div>

      <div className="pboard-actions">
        <button onClick={onCancel}>Cancel</button>
        <button className="pboard-confirm-btn" onClick={handleConfirm} disabled={!isCorrect || noStamina}>
          Confirm (1 stamina)
        </button>
      </div>
    </div>
  )
}
