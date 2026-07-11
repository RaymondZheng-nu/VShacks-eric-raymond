// renders the day summary panel; returns null if no summary
export default function DaySummary({ summary }) {
  if (!summary) return null

  return (
    <section className="day-summary">
      <h2>{summary.dayName}, Week {summary.week}</h2>
      <ul className="day-summary-contributions">
        {(summary.contributions ?? []).map((c, i) => (
          <li key={i} className="day-summary-row">
            <span>{c.source}</span>
            {/* probably should be a lookup obj */}
            <span className={
              c.type === 'chips' ? 'day-summary-chips'
              : c.type === '+mult' ? 'day-summary-mult'
              : c.type === 'xmult' ? 'day-summary-xmult'
              : ''
            }>
              {c.type === 'chips' && `+${c.value} chips`}
              {c.type === '+mult' && `+${c.value} mult`}
              {c.type === 'xmult' && `×${c.value} mult`}
            </span>
          </li>
        ))}
      </ul>
      <div className="day-summary-total">
        {summary.chips} chips × {summary.mult} mult = {summary.scoreTotal} points
      </div>
      {summary.dailyCredits > 0 && (
        <div>+{summary.dailyCredits} credits (online machines)</div>
      )}
      {summary.isQuotaDay && summary.quotaPassed === true && (
        <div className="day-summary-pass">quota passed +{summary.creditsEarned} credits</div>
      )}
      {summary.isQuotaDay && summary.quotaPassed === false && (
        <div className="day-summary-fail">quota failed. game over i guess</div>
      )}
    </section>
  )
}
