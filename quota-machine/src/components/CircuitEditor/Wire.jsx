// A single connection between two grid ports (a node output feeding
// another node's input). Purely presentational — the underlying edge is
// just an entry in a node's `inputs` array for evaluateCircuit().
// Props: { from: { x, y }, to: { x, y } }
export default function Wire({ from, to }) {
  return (
    <svg className="circuit-wire" pointerEvents="none">
      <line x1={from?.x ?? 0} y1={from?.y ?? 0} x2={to?.x ?? 0} y2={to?.y ?? 0} />
      {/* TODO: routed orthogonal path instead of a straight line, active/error styling */}
    </svg>
  )
}
