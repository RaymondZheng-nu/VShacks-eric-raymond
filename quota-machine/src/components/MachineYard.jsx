import { getMachineById } from '../data/machines'

// lists every owned machine offline ones can be installed or repaired
export default function MachineYard({ ownedMachines, onSolve }) {
  return (
    <section className="machine-yard">
      <h2>Machines</h2>
      {ownedMachines.length === 0 ? (
        <p>No machines yet — visit the shop.</p>
      ) : (
        <>
        {/* todo drag and drop someday */}
        <ul className="machine-yard-list">
          {ownedMachines.map((owned) => {
            const machine = getMachineById(owned.machineId)
            const isRepair = owned.failureThreshold != null && !owned.online
            const stability = owned.online && owned.failureThreshold != null
              ? Math.max(0, owned.failureThreshold - owned.turnsSinceSolved)
              : null
            return (
              <li key={owned.instanceId} className="machine-yard-item">
                <span>{machine?.name ?? owned.machineId}</span>
                <span className={owned.online ? 'status-online' : 'status-offline'}>
                  {owned.online ? 'Online' : 'Offline'}
                </span>
                {stability != null && (
                  <span className="machine-yard-stability" title="turns until failure">{stability}t</span>
                )}
                {isRepair && <span className="machine-yard-repair-badge">REPAIR</span>}
                {!owned.online && (
                  <button onClick={() => onSolve(owned.instanceId)}>{isRepair ? 'Repair' : 'Install'}</button>
                )}
              </li>
            )
          })}
        </ul>
        </>
      )}
    </section>
  )
}
