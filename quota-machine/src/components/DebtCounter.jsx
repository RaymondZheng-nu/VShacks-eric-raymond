import { QUOTA_CHECK_DAY } from '../game/gameState'

// Shows how many days remain until the Saturday quota deadline.
export default function QuotaDeadline({ week, dayOfWeek }) {
  const daysLeft = QUOTA_CHECK_DAY - dayOfWeek
  return (
    <section className="quota-deadline">
      <h2>Deadline</h2>
      <p>Quota due Saturday of Week {week}</p>
      <p>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</p>
    </section>
  )
}
