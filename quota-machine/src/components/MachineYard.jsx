import { getMachineById } from '../data/machines'

// shows unplaced machines with a button to select placement
export default function MachineYard({ ownedMachines, selectedInstanceId, onSelect }) {
  const unplaced = ownedMachines.filter((m) => !m.position)

  return (
    <section className="machine-yard">
      <h2>Inventory</h2>
      {unplaced.length === 0 ? (
        <p>All machines are on the Rack.</p>
      ) : (
        <>
        {/* TODO: drag and drop someday */}
        <ul className="machine-yard-list">
          {unplaced.map((owned) => {
            const machine = getMachineById(owned.machineId)
            const isSelected = owned.instanceId === selectedInstanceId
            const itemClass = isSelected ? 'machine-yard-item machine-yard-item--selected' : 'machine-yard-item'
            return (
              <li
                key={owned.instanceId}
                className={itemClass}
              >
                <span>{machine?.name ?? owned.machineId}</span>
                <button onClick={() => onSelect(isSelected ? null : owned.instanceId)}>
                  {isSelected ? 'Cancel' : 'Place'}
                </button>
              </li>
            )
          })}
        </ul>
        </>
      )}
    </section>
  )
}
