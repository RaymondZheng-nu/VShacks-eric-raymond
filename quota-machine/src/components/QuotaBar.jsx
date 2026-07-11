// Renders the current turn's quota progress bar.
// Props: { quotaProgress: number, quotaRequired: number }
export default function QuotaBar({ quotaProgress, quotaRequired }) {
  const pct = Math.min(100, Math.round((quotaProgress / quotaRequired) * 100))

  return (
    <section className="quota-bar">
      <h2>Quota</h2>
      <div className="quota-bar-track">
        <div className="quota-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p>
        {quotaProgress} / {quotaRequired}
      </p>
      {/* TODO: animate fill, show per-machine contribution breakdown */}
    </section>
  )
}
