import { getMachineById } from '../data/machines'

// Displays owned machines, their online/offline status, and lets the
// player pick one to open in CircuitEditor (to solve its puzzle and bring
// it online, or re-solve it after a failure).
// Props: { ownedMachines: OwnedMachine[], connections: Connection[], setState: (fn) => void }
export default function MachineYard({ ownedMachines, connections = [] }) {
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
              {/* TODO: click to open CircuitEditor with machine's puzzleId,
                  call gameState.bringMachineOnline() on a validateCircuit() pass */}
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
