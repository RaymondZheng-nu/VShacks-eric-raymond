// Purely presentational SVG line between two grid ports.
export default function Wire({ from, to }) {
  return (
    <svg className="circuit-wire" pointerEvents="none">
      <line x1={from?.x ?? 0} y1={from?.y ?? 0} x2={to?.x ?? 0} y2={to?.y ?? 0} />
    </svg>
  )
}
