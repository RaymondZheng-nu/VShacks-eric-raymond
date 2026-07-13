import QuotaBar from './QuotaBar.jsx'
import QuotaDeadline from './DebtCounter.jsx'
import StaminaCounter from './StaminaCounter.jsx'

export default function StatsPanel({
  quotaProgress,
  quotaRequired,
  week,
  dayOfWeek,
  day,
  stamina,
  maxStamina,
  credits,
  debt,
  ownedMachines,
  connections,
}) {
  const machinesOnline = ownedMachines.filter((m) => m.online).length
  const machinesFailed = ownedMachines.filter((m) => !m.online && m.failureThreshold != null).length // "failed" = broke and needs repair, not permanently gone

  return (
    <>
      <section>
        <h2>Day {day}</h2>
        <p>Credits: {credits}</p>
        {debt > 0 && <p className="debt-counter-game-over">Debt: {debt}</p>}
      </section>
      <QuotaBar quotaProgress={quotaProgress} quotaRequired={quotaRequired} />
      <QuotaDeadline week={week} dayOfWeek={dayOfWeek} />
      <StaminaCounter stamina={stamina} maxStamina={maxStamina} />
      <section>
        <h2>Machines</h2>
        <p>{ownedMachines.length} owned, {machinesOnline} online, {machinesFailed} failed</p>
      </section>
      <section>
        <h2>Connections</h2>
        <p>{connections.length} active synerg{connections.length === 1 ? 'y' : 'ies'}</p>
      </section>
    </>
  )
}
