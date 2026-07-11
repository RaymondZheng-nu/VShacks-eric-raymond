import { getMachineById } from '../data/machines'

// shows unplaced machines with a button to select placement
export default function MachineYard({ ownedMachines, selectedInstanceId, onSelect }) {
  const inventory = ownedMachines.filter((m) => !m.position)

  return (
    <section className="machine-yard">
      <h2>Inventory</h2>
      {inventory.length === 0 ? (
        <p>All machines are on the Rack.</p>
      ) : (
        <ul className="machine-yard-list">
          {inventory.map((owned) => {
            const machine = getMachineById(owned.machineId)
            const isSelected = owned.instanceId === selectedInstanceId
            return (
              <li
                key={owned.instanceId}
                className={isSelected ? 'machine-yard-item machine-yard-item--selected' : 'machine-yard-item'}
              >
                <span>{machine?.name ?? owned.machineId}</span>
                <button onClick={() => onSelect(isSelected ? null : owned.instanceId)}>
                  {isSelected ? 'Cancel' : 'Place'}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
