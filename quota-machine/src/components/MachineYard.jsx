import { getMachineById } from '../data/machines'

// Displays owned machines, their online/offline status, and lets the
// player pick an offline one to open in CircuitEditor (to solve its
// puzzle and bring it online, or re-solve it after a failure).
// Props: { ownedMachines: OwnedMachine[], connections: Connection[], onSelectMachine: (ownedMachine) => void }
export default function MachineYard({ ownedMachines, connections = [], onSelectMachine }) {
  return (
    <section className="machine-yard">
      <h2>Machine Yard</h2>
      {ownedMachines.length === 0 && <p>No machines yet — visit the shop.</p>}
      <ul className="machine-yard-list">
        {ownedMachines.map((owned) => {
          const machine = getMachineById(owned.machineId)
          return (
            <li key={owned.instanceId} className="machine-yard-item">
              <span>{machine?.name ?? owned.machineId}</span>
              <span className={owned.online ? 'status-online' : 'status-offline'}>
                {owned.online ? 'Online' : 'Offline'}
              </span>
              {!owned.online && <button onClick={() => onSelectMachine(owned)}>Solve</button>}
            </li>
          )
        })}
      </ul>
      {/* TODO: drag-to-connect two machines to open a synergy connection puzzle,
          call gameState.addConnection() on success */}
      <p className="machine-yard-connections">Connections: {connections.length}</p>
    </section>
  )
}
