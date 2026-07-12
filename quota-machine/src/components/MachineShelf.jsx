import { useEffect, useRef, useState } from 'react'
import { getMachineById } from '../data/machines'
import { SHELF_SLOTS } from '../data/shelfSlots'

const SHELF_SPRITE = `${import.meta.env.BASE_URL}sprites/machines/generic.png`

// returns slot position as plain numbers or null if not on shelf
function slotPositionFor(instanceId, ownedMachines) {
  const index = ownedMachines.slice(0, SHELF_SLOTS.length).findIndex((m) => m.instanceId === instanceId)
  if (index === -1) return null
  const slot = SHELF_SLOTS[index]
  return { x: parseFloat(slot.x), y: parseFloat(slot.y) } // parseFloat strips the '%' from shelfSlots strings
}

// auto-places owned machines on fixed shelf slots in purchase order — no drag/placement
// all 6 machines have real on/off art now, generic sprite is just a safety fallback
export default function MachineShelf({ ownedMachines, onSolve, connectingMode, selectedMachineA, onConnectClick, connections }) {
  const prevOnlineRef = useRef({}) // instanceId -> online, so we can spot offline->online transitions
  const [justOnline, setJustOnline] = useState(new Set())

  // flags machines that just flipped offline->online so their sprite can flash briefly
  useEffect(() => {
    const prevOnline = prevOnlineRef.current
    const newlyOnline = ownedMachines.filter((m) => m.online && prevOnline[m.instanceId] === false).map((m) => m.instanceId)
    if (newlyOnline.length > 0) {
      setJustOnline((prev) => new Set([...prev, ...newlyOnline]))
      newlyOnline.forEach((id) => {
        setTimeout(() => {
          setJustOnline((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        }, 500)
      })
    }
    prevOnlineRef.current = Object.fromEntries(ownedMachines.map((m) => [m.instanceId, m.online]))
  }, [ownedMachines])

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
        // failed = was online, broke down and needs repair; offline+no threshold = never installed yet
        const isFailed = !owned.online && owned.failureThreshold != null
        const justCameOnline = justOnline.has(owned.instanceId)
        // pick on/off art per machine, this reads owned.online fresh every render so it just tracks state
        const hasCustomSprite = Boolean(machine?.spriteOn && machine?.spriteOff)
        const sprite = owned.online ? (machine?.spriteOn ?? SHELF_SPRITE) : (machine?.spriteOff ?? SHELF_SPRITE)
        return (
          <button
            key={owned.instanceId}
            className={`shelf-machine${owned.online ? ' shelf-machine--online' : ''}${isSelected ? ' shelf-machine--selected' : ''}${isFailed ? ' shelf-machine--failed' : ''}${justCameOnline ? ' shelf-machine--just-online' : ''}${hasCustomSprite ? ' shelf-machine--custom-sprite' : ''}`}
            style={{ left: slot.x, top: slot.y }}
            onClick={() => handleClick(owned)}
            title={machine?.name ?? owned.machineId}
          >
            <img src={sprite} alt={machine?.name ?? owned.machineId} />
            {isFailed && <span className="shelf-machine-tint" />}
            {isFailed && <span className="shelf-machine-warning">!</span>}
          </button>
        )
      })}
    </>
  )
}
