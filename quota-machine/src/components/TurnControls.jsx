import { DAY_NAMES, QUOTA_CHECK_DAY } from '../game/gameState'

// Day/week display and End Day / End Week button.
export default function TurnControls({ day, week, dayOfWeek, onEndTurn, disabled }) {
  return (
    <section className="turn-controls">
      <h2>Week {week} — {DAY_NAMES[dayOfWeek - 1]}</h2>
      <button onClick={onEndTurn} disabled={disabled}>
        {dayOfWeek === QUOTA_CHECK_DAY ? 'End Week (Quota Check)' : 'End Day'}
      </button>
    </section>
  )
}
