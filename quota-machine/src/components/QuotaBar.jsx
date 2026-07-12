// renders weekly quota progress bar
export default function QuotaBar({ quotaProgress, quotaRequired }) {
  const pct = Math.min(100, Math.round((quotaProgress / quotaRequired) * 100))

  return (
    <section className="quota-bar">
      <h2>Quota</h2>
      <div className="quota-bar-track">
        <div className="quota-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p>{quotaProgress} / {quotaRequired}</p>
    </section>
  )
}
