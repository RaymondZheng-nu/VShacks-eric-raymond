// shown on top of a passed circuit, sits over the grid until the player clicks
// single click handler on the outer overlay only, the button has no handler of its own
// so a click anywhere inside, panel or button, bubbles up and dismisses exactly once
export default function CircuitComplete({ label, result, onDismiss }) {
  return (
    <div className="circuit-complete-overlay" onClick={onDismiss}>
      <div className="circuit-complete-panel">
        <h2>Check Passed</h2>
        <p className="circuit-complete-label">{label}</p>
        <p className="circuit-complete-result">{result}</p>
        <button>Continue</button>
      </div>
    </div>
  )
}
