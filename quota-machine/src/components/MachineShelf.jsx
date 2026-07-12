import { getMachineById } from '../data/machines'
import { SHELF_SLOTS } from '../data/shelfSlots'

const SHELF_SPRITE = '/quota-machine/sprites/machines/generic.png'

// looks up a shelved machine's slot center as numbers, or null if it isn't on the shelf
function slotPositionFor(instanceId, ownedMachines) {
  const index = ownedMachines.slice(0, SHELF_SLOTS.length).findIndex((m) => m.instanceId === instanceId)
  if (index === -1) return null
  const slot = SHELF_SLOTS[index]
  return { x: parseFloat(slot.x), y: parseFloat(slot.y) }
}

// auto-places owned machines on fixed shelf slots in purchase order — no drag/placement
// TODO: swap SHELF_SPRITE for a per-machine sprite (owned.machineId / artKey) once that art exists
export default function MachineShelf({ ownedMachines, onSolve, connectingMode, selectedMachineA, onConnectClick, connections }) {
  // in connection mode, clicks select machines instead of opening the install/repair puzzle
  function handleClick(owned) {
    if (connectingMode) {
      onConnectClick(owned)
      return
    }
    if (!owned.online) onSolve(owned.instanceId)
  }

  return (
    <>
      <svg className="connection-lines">
        {(connections ?? []).map((conn) => {
          const [idA, idB] = conn.machineInstanceIds
          const posA = slotPositionFor(idA, ownedMachines)
          const posB = slotPositionFor(idB, ownedMachines)
          if (!posA || !posB) return null
          return (
            <line
              key={conn.instanceId}
              className="connection-line"
              x1={`${posA.x}%`}
              y1={`${posA.y}%`}
              x2={`${posB.x}%`}
              y2={`${posB.y}%`}
            />
          )
        })}
      </svg>

      {ownedMachines.slice(0, SHELF_SLOTS.length).map((owned, i) => {
        const machine = getMachineById(owned.machineId)
        const slot = SHELF_SLOTS[i]
        const isSelected = owned.instanceId === selectedMachineA
        return (
          <button
            key={owned.instanceId}
            className={`shelf-machine${owned.online ? ' shelf-machine--online' : ''}${isSelected ? ' shelf-machine--selected' : ''}`}
            style={{ left: slot.x, top: slot.y }}
            onClick={() => handleClick(owned)}
            title={machine?.name ?? owned.machineId}
          >
            <img src={SHELF_SPRITE} alt={machine?.name ?? owned.machineId} />
          </button>
        )
      })}
    </>
  )
}
