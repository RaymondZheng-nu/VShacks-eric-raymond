// A single placed gate (or INPUT/OUTPUT pin) on the grid. Purely
// presentational — the node's logical type/inputs live in editor state
// and get passed straight to engine/circuit-engine.js's evaluateCircuit().
// Props: { node: { id, type, inputs? }, onSelect?: () => void }
export default function GateNode({ node, onSelect }) {
  return (
    <button className={`gate-node gate-node--${node.type.toLowerCase()}`} onClick={onSelect}>
      {node.type}
      {/* TODO: input/output port markers, drag handle */}
    </button>
  )
}
