// Renders the placed circuit nodes in fixed columns (Inputs / Gates /
// Outputs) — grid-based placement, not freeform dragging. Clicking a node
// starts or completes a wire (see CircuitEditor's handleSelectNode); wires
// into a node are shown as removable tags rather than as Wire.jsx lines.
// Props: { puzzle: Puzzle, nodes, pendingSource, onSelectNode, onClearWire }
import GateNode from './GateNode.jsx'

export default function Grid({ puzzle, nodes, pendingSource, onSelectNode, onClearWire }) {
  const inputNodes = nodes.filter((n) => n.type === 'INPUT')
  const outputNodes = nodes.filter((n) => n.type === 'OUTPUT')
  const gateNodes = nodes.filter((n) => n.type !== 'INPUT' && n.type !== 'OUTPUT')
  const nameFor = (id) => nodes.find((n) => n.id === id)?.id ?? id

  return (
    <div className="circuit-grid" data-puzzle-id={puzzle?.id}>
      <div className="circuit-grid-col">
        <h4>Inputs</h4>
        {inputNodes.map((node) => (
          <GateNode key={node.id} node={node} selected={pendingSource === node.id} onSelect={() => onSelectNode(node)} />
        ))}
      </div>

      <div className="circuit-grid-col">
        <h4>Gates {pendingSource && <span>(wiring from "{pendingSource}" — click a target)</span>}</h4>
        {gateNodes.length === 0 && <p>Add a gate from the palette above.</p>}
        {gateNodes.map((node) => (
          <div key={node.id} className="circuit-grid-gate-row">
            <GateNode node={node} selected={pendingSource === node.id} onSelect={() => onSelectNode(node)} />
            <div className="circuit-grid-wires">
              {(node.inputs || []).map((sourceId, i) => (
                <span key={i} className="circuit-grid-wire-tag">
                  {nameFor(sourceId)} <button onClick={() => onClearWire(node.id, i)}>&times;</button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="circuit-grid-col">
        <h4>Outputs</h4>
        {outputNodes.map((node) => (
          <div key={node.id} className="circuit-grid-gate-row">
            <GateNode node={node} selected={false} onSelect={() => onSelectNode(node)} />
            <div className="circuit-grid-wires">
              {(node.inputs || []).map((sourceId, i) => (
                <span key={i} className="circuit-grid-wire-tag">
                  {nameFor(sourceId)} <button onClick={() => onClearWire(node.id, i)}>&times;</button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
