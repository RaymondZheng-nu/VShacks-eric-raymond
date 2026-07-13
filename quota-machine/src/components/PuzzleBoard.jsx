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

function layoutNodes(nodes) {
  const inputNodes  = nodes.filter(n => n.type === 'INPUT')
  const outputNodes = nodes.filter(n => n.type === 'OUTPUT')
  const gateNodes   = nodes.filter(n => n.type !== 'INPUT' && n.type !== 'OUTPUT')

  // topological layer for every node
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

  // group gates by layer
  const byLayer = {}
  gateNodes.forEach(n => {
    const l = layerOf[n.id]
    if (!byLayer[l]) byLayer[l] = []
    byLayer[l].push(n)
  })
  const maxGatesInLayer = Object.values(byLayer).reduce((m, g) => Math.max(m, g.length), 0)
  const maxGateLayer    = gateNodes.length ? Math.max(...gateNodes.map(n => layerOf[n.id])) : 0

  const rows = Math.max(inputNodes.length, outputNodes.length, maxGatesInLayer)
  const VH   = Math.max(rows * 90 + 40, 160)

  const pos = {}

  // inputs: evenly spread on left
  inputNodes.forEach((n, i) => {
    pos[n.id] = { x: 65, y: VH / (inputNodes.length + 1) * (i + 1) }
  })

  // gates: resolve in topological order, spread each layer evenly by sorted idealY
  const ordered = [...gateNodes].sort((a, b) => layerOf[a.id] - layerOf[b.id])
  const xGate = (l) => 65 + (l / (maxGateLayer + 1)) * (VW - 130)

  // process each layer: compute ideal Y per gate, sort, then assign evenly-spaced Y
  Object.entries(byLayer)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([l, gates]) => {
      const withIdeal = gates.map(n => {
        const ys = n.inputs.map(id => pos[id]?.y ?? VH / 2)
        const idealY = ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : VH / 2
        return { n, idealY }
      }).sort((a, b) => a.idealY - b.idealY)

      const count = withIdeal.length
      withIdeal.forEach(({ n }, i) => {
        pos[n.id] = { x: xGate(parseInt(l)), y: VH / (count + 1) * (i + 1) }
      })
    })

  // outputs: Y = source gate's Y
  outputNodes.forEach((n, i) => {
    const srcY = n.inputs.length && pos[n.inputs[0]] != null
      ? pos[n.inputs[0]].y
      : VH / (outputNodes.length + 1) * (i + 1)
    pos[n.id] = { x: VW - 65, y: srcY }
  })

  return { pos, VH }
}

function wirePath(a, b) {
  const mx = (a.x + b.x) / 2
  return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`
}

// pick a target row and a starting input state that doesn't already match
function pickInit(puzzle, staticNodes) {
  const rows = puzzle.spec.rows
  const targetRow = rows[Math.floor(Math.random() * rows.length)]

  let inputValues = null
  if (staticNodes) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const vals = Object.fromEntries(
        puzzle.spec.inputIds.map(id => [id, Math.random() > 0.5])
      )
      try {
        const outs = evaluateCircuit(staticNodes, vals)
        const matches = puzzle.spec.outputIds.every(id => outs[id] === targetRow.expected[id])
        if (!matches) { inputValues = vals; break }
      } catch {}
    }
  }

  // fallback: all-false (safe default that usually doesn't match target for non-trivial gates)
  if (!inputValues) {
    inputValues = Object.fromEntries(puzzle.spec.inputIds.map(id => [id, false]))
  }

  return { targetRow, inputValues }
}

export default function PuzzleBoard({ puzzle, isRepair, gameState, setGameState, onSolved, onCancel }) {
  const staticNodes = PUZZLE_CIRCUITS[puzzle.id]

  const [{ targetRow, inputValues: initVals }] = useState(() => pickInit(puzzle, staticNodes))
  const [inputValues, setInputValues] = useState(initVals)

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
        <p style={{ color: '#f87171' }}>No circuit defined for: {puzzle.id}</p>
        <button onClick={onCancel}>Cancel</button>
      </div>
    )
  }

  const { pos, VH } = layoutNodes(staticNodes)
  const gateNodes = staticNodes.filter(n => n.type !== 'INPUT' && n.type !== 'OUTPUT')

  // build wire list, deduplicating same-source-same-target pairs
  const seen = new Set()
  const wires = []
  staticNodes.forEach(node => {
    if (node.type === 'INPUT') return
    ;(node.inputs || []).forEach(srcId => {
      const key = `${srcId}=>${node.id}`
      if (seen.has(key)) return
      seen.add(key)
      const a = pos[srcId], b = pos[node.id]
      if (a && b) wires.push({ d: wirePath(a, b), key })
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

      <div className="pboard-diagram" style={{ paddingBottom: `${(VH / VW) * 100}%` }}>
        <div className="pboard-diagram-inner">
          <svg className="pboard-wires" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet">
            {wires.map(w => <path key={w.key} d={w.d} className="pboard-wire" />)}
          </svg>

          {puzzle.spec.inputIds.map(id => {
            const p = pos[id]
            const on = inputValues[id]
            return (
              <button
                key={id}
                className={`pboard-node pboard-switch${on ? ' pboard-switch--on' : ''}`}
                style={{ left: `${(p.x / VW) * 100}%`, top: `${(p.y / VH) * 100}%` }}
                onClick={() => toggleInput(id)}
              >
                <img src={`${BASE}/${on ? 'switch-closed' : 'switch-open'}.png`} alt={on ? 'closed' : 'open'} className="pboard-sprite" />
                <span className="pboard-node-id">{id.toUpperCase()}</span>
                <span className={`pboard-node-val ${on ? 'on' : 'off'}`}>{on ? '1' : '0'}</span>
              </button>
            )
          })}

          {gateNodes.map(node => {
            const p = pos[node.id]
            const sprite = GATE_SPRITE[node.type]
            return (
              <div key={node.id} className="pboard-node pboard-gate" style={{ left: `${(p.x / VW) * 100}%`, top: `${(p.y / VH) * 100}%` }}>
                {sprite && <img src={sprite} alt={node.type} className="pboard-sprite pboard-gate-sprite" />}
                <span className="pboard-node-id">{node.type}</span>
              </div>
            )
          })}

          {puzzle.spec.outputIds.map(id => {
            const p = pos[id]
            const on = outputs?.[id]
            const matchesTarget = on === targetRow.expected[id]
            return (
              <div
                key={id}
                className={`pboard-node pboard-output${on ? ' pboard-output--on' : ''}${matchesTarget ? ' pboard-output--match' : ''}`}
                style={{ left: `${(p.x / VW) * 100}%`, top: `${(p.y / VH) * 100}%` }}
              >
                <img src={`${BASE}/DC.png`} alt={id} className="pboard-sprite pboard-output-sprite" style={{ opacity: on ? 1 : 0.2 }} />
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
            ? '✓ Output matches — confirm to complete'
            : '✗ Toggle switches until the output matches the target'}
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
