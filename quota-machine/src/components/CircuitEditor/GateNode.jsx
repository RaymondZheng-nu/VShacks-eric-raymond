// A single placed gate (or INPUT/OUTPUT pin) on the grid. Purely
// presentational — the node's logical type/inputs live in editor state
// and get passed straight to engine/circuit-engine.js's evaluateCircuit().
// Props: { node: { id, type, inputs? }, selected?: boolean, onSelect?: () => void }
export default function GateNode({ node, selected, onSelect }) {
  return (
    <button
      className={`gate-node gate-node--${node.type.toLowerCase()}${selected ? ' gate-node--selected' : ''}`}
      onClick={onSelect}
    >
      {node.id}
      <span className="gate-node-type">{node.type}</span>
    </button>
  )
}
