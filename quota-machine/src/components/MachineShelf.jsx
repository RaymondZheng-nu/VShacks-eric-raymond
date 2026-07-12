import { getMachineById } from '../data/machines'
import { SHELF_SLOTS } from '../data/shelfSlots'

const SHELF_SPRITE = '/quota-machine/sprites/machines/generic.png'

// auto-places owned machines on fixed shelf slots in purchase order — no drag/placement
// TODO: swap SHELF_SPRITE for a per-machine sprite (owned.machineId / artKey) once that art exists
export default function MachineShelf({ ownedMachines, onSolve }) {
  return (
    <>
      {ownedMachines.slice(0, SHELF_SLOTS.length).map((owned, i) => {
        const machine = getMachineById(owned.machineId)
        const slot = SHELF_SLOTS[i]
        return (
          <button
            key={owned.instanceId}
            className={`shelf-machine${owned.online ? ' shelf-machine--online' : ''}`}
            style={{ left: slot.x, top: slot.y }}
            onClick={() => !owned.online && onSolve(owned.instanceId)}
            title={machine?.name ?? owned.machineId}
          >
            <img src={SHELF_SPRITE} alt={machine?.name ?? owned.machineId} />
          </button>
        )
      })}
    </>
  )
}
