import { useState, useMemo } from 'react'
import { evaluateCircuit } from '../engine/circuit-engine'
import { spendStamina } from '../game/turn'
import CircuitComplete from './CircuitComplete.jsx'

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

const INPUT_LABELS = ['a','b','c','d','e','f','g','h']
const TWO_INPUT_GATES = ['AND','OR','XOR','NAND','NOR']
const ONE_INPUT_GATES = ['NOT','BUFFER']
const ALL_GATES = [...TWO_INPUT_GATES, ...ONE_INPUT_GATES]

const VW = 500

function generateRandomCircuit(day = 1) {
  // difficulty scales every 5 days, capped at tier 3
  const tier = Math.min(Math.floor((day - 1) / 5), 3)
  const minInputs = 2 + tier
  const inputRange = 2 + tier
  const numInputs = Math.min(minInputs + Math.floor(Math.random() * (inputRange + 1)), 8)
  const inputIds = INPUT_LABELS.slice(0, numInputs)
  const nodes = inputIds.map(id => ({ id, type: 'INPUT', inputs: [] }))

  let available = [...inputIds]
  const minLayers = tier >= 2 ? 3 : 2
  const numLayers = minLayers + Math.floor(Math.random() * (tier >= 2 ? 2 : 1))
  let gateIdx = 0

  for (let layer = 0; layer < numLayers; layer++) {
    const isLastLayer = layer === numLayers - 1
    const numGates = isLastLayer ? 1 : 1 + Math.floor(Math.random() * 2) // last layer always 1 gate
    const layerOutputs = []

    for (let g = 0; g < numGates; g++) {
      const gateType = ALL_GATES[Math.floor(Math.random() * ALL_GATES.length)]
      const id = `g${gateIdx++}`
      const isSingle = ONE_INPUT_GATES.includes(gateType)

      let inputs
      if (isSingle) {
        const src = available[Math.floor(Math.random() * available.length)]
        inputs = [src]
      } else {
        // pick 2 from available, allowing same source if only 1 available
        const src1 = available[Math.floor(Math.random() * available.length)]
        let src2 = available[Math.floor(Math.random() * available.length)]
        inputs = [src1, src2]
      }

      nodes.push({ id, type: gateType, inputs })
      layerOutputs.push(id)
    }

    available = layerOutputs
  }

  // the last gate's output feeds the OUTPUT node
  const lastGate = available[available.length - 1]
  nodes.push({ id: 'out', type: 'OUTPUT', inputs: [lastGate] })

  return { nodes, inputIds }
}

function computeTruthTableAndPickTarget(nodes, inputIds) {
  const rows = []
  const total = 1 << inputIds.length
  for (let mask = 0; mask < total; mask++) {
    const vals = {}
    inputIds.forEach((id, i) => { vals[id] = Boolean((mask >> (inputIds.length - 1 - i)) & 1) })
    try {
      const outs = evaluateCircuit(nodes, vals)
      rows.push({ inputValues: vals, expected: { out: outs['out'] } })
    } catch {}
  }
  if (!rows.length) return null
  // prefer a target row where all-false starting state is NOT already correct
  const allFalseVals = Object.fromEntries(inputIds.map(id => [id, false]))
  try {
    const allFalseOuts = evaluateCircuit(nodes, allFalseVals)
    const nonTrivial = rows.filter(r => r.expected['out'] !== allFalseOuts['out'])
    if (nonTrivial.length > 0) return nonTrivial[Math.floor(Math.random() * nonTrivial.length)]
  } catch {}
  return rows[Math.floor(Math.random() * rows.length)]
}

function pickStartingState(inputIds, nodes, targetRow) {
  // always start all-off (all gray); computeTruthTableAndPickTarget already avoids trivially-solved targets
  const allFalse = Object.fromEntries(inputIds.map(id => [id, false]))
  try {
    const outs = evaluateCircuit(nodes, allFalse)
    if (outs['out'] !== targetRow.expected['out']) return allFalse
  } catch {}
  // fallback if all-false somehow already matches: flip first input
  const vals = { ...targetRow.inputValues }
  vals[inputIds[0]] = !vals[inputIds[0]]
  return vals
}

function layoutNodes(nodes) {
  const inputNodes  = nodes.filter(n => n.type === 'INPUT')
  const outputNodes = nodes.filter(n => n.type === 'OUTPUT')
  const gateNodes   = nodes.filter(n => n.type !== 'INPUT' && n.type !== 'OUTPUT')

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

  inputNodes.forEach((n, i) => {
    pos[n.id] = { x: 65, y: VH / (inputNodes.length + 1) * (i + 1) }
  })

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
        pos[n.id] = { x: 65 + (parseInt(l) / (maxGateLayer + 1)) * (VW - 130), y: VH / (count + 1) * (i + 1) }
      })
    })

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

export default function PuzzleBoard({ puzzle, isRepair, gameState, setGameState, onSolved, onCancel, onDismiss, completeLabel, completeResult }) {
  const [circuit] = useState(() => {
    const { nodes, inputIds } = generateRandomCircuit(gameState?.day ?? 1)
    const targetRow = computeTruthTableAndPickTarget(nodes, inputIds)
    const startVals = targetRow ? pickStartingState(inputIds, nodes, targetRow) : Object.fromEntries(inputIds.map(id => [id, false]))
    return { nodes, inputIds, targetRow, startVals }
  })

  const [inputValues, setInputValues] = useState(circuit.startVals)
  // stays true once confirmed so the completion screen sticks around over the finished board
  const [solved, setSolved] = useState(false)

  const outputs = useMemo(() => {
    try { return evaluateCircuit(circuit.nodes, inputValues) }
    catch { return null }
  }, [circuit.nodes, inputValues])

  const isCorrect = outputs != null && circuit.targetRow != null &&
    outputs['out'] === circuit.targetRow.expected['out']

  function toggleInput(id) {
    setInputValues(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function handleConfirm() {
    if (!isCorrect || gameState.stamina <= 0) return
    const spend = spendStamina(gameState)
    if (!spend.ok) return
    setGameState(spend.state)
    setSolved(true)
    onSolved()
  }

  const { pos, VH } = layoutNodes(circuit.nodes)
  const gateNodes = circuit.nodes.filter(n => n.type !== 'INPUT' && n.type !== 'OUTPUT')

  const seen = new Set()
  const wires = []
  circuit.nodes.forEach(node => {
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
          <span className={`pboard-target-val pboard-target-val--${circuit.targetRow?.expected['out'] ? 'on' : 'off'}`}>
            OUT = {circuit.targetRow?.expected['out'] ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      <div className="pboard-diagram" style={{ paddingBottom: `${(VH / VW) * 100}%` }}>
        <div className="pboard-diagram-inner">
          <svg className="pboard-wires" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet">
            {wires.map(w => <path key={w.key} d={w.d} className="pboard-wire" />)}
          </svg>

          {circuit.inputIds.map(id => {
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

          {(() => {
            const p = pos['out']
            const on = outputs?.['out']
            const matchesTarget = on === circuit.targetRow?.expected['out']
            return (
              <div
                className={`pboard-node pboard-output${on ? ' pboard-output--on' : ''}${matchesTarget ? ' pboard-output--match' : ''}`}
                style={{ left: `${(p.x / VW) * 100}%`, top: `${(p.y / VH) * 100}%` }}
              >
                <img src={`${BASE}/DC.png`} alt="out" className="pboard-sprite pboard-output-sprite" style={{ opacity: on ? 1 : 0.2 }} />
                <span className="pboard-node-id">OUT</span>
                <span className={`pboard-node-val ${on ? 'on' : 'off'}`}>{on ? '1' : '0'}</span>
              </div>
            )
          })()}
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

      {solved && (
        <CircuitComplete label={completeLabel} result={completeResult} onDismiss={onDismiss} />
      )}
    </div>
  )
}
