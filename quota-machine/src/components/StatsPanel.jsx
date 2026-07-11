import QuotaBar from './QuotaBar.jsx'
import QuotaDeadline from './DebtCounter.jsx'
import StaminaCounter from './StaminaCounter.jsx'

export default function StatsPanel({ quotaProgress, quotaRequired, week, dayOfWeek, stamina, maxStamina }) {
  return (
    <>
      <QuotaBar quotaProgress={quotaProgress} quotaRequired={quotaRequired} />
      <QuotaDeadline week={week} dayOfWeek={dayOfWeek} />
      <StaminaCounter stamina={stamina} maxStamina={maxStamina} />
    </>
  )
}
