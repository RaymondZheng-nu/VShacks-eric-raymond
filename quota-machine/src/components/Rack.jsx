import { useRef } from 'react'
import { RACK_ROWS, RACK_COLS } from '../game/gameState'
import { getMachineById } from '../data/machines'

// renders the rack grid with warehouse backdrop
export default function Rack({ ownedMachines, pendingInstanceId, onSlotClick, onMachineClick, onRemove }) {
  const cellRefs = useRef([])

  const placedByPos = {}
  for (const m of ownedMachines) {
    if (m.position != null) {
      placedByPos[`${m.position.row},${m.position.col}`] = m
    }
  }

  // arrow key nav. this was annoying to write
  function handleKeyDown(e, row, col) {
    let nextRow = row
    let nextCol = col
    if (e.key === 'ArrowUp') nextRow = row - 1
    else if (e.key === 'ArrowDown') nextRow = row + 1
    else if (e.key === 'ArrowLeft') nextCol = col - 1
    else if (e.key === 'ArrowRight') nextCol = col + 1
    else if (e.key === 'Enter') {
      e.preventDefault()
      cellRefs.current[row * RACK_COLS + col]?.click()
      return
    } else {
      return
    }
    if (nextRow < 0 || nextRow >= RACK_ROWS || nextCol < 0 || nextCol >= RACK_COLS) return
    e.preventDefault()
    cellRefs.current[nextRow * RACK_COLS + nextCol]?.focus()
  }

  const slots = []
  for (let row = 0; row < RACK_ROWS; row++) {
    for (let col = 0; col < RACK_COLS; col++) {
      const placed = placedByPos[`${row},${col}`]
      const machine = placed ? getMachineById(placed.machineId) : null

      let className = 'rack-slot'
      if (placed) {
        className += ' rack-slot--filled'
        if (placed.online) className += ' rack-slot--online'
      } else if (pendingInstanceId) {
        className += ' rack-slot--droppable'
      }

      const turns_left = placed ? Math.max(0, placed.failureThreshold - placed.turnsSinceSolved) : 0

      slots.push(
        <button
          key={`r${row}c${col}`}
          ref={(el) => { cellRefs.current[row * RACK_COLS + col] = el }}
          className={className}
          onClick={() => placed ? onMachineClick(placed) : onSlotClick(row, col)}
          onKeyDown={(e) => handleKeyDown(e, row, col)}
        >
          {placed ? (
            <>
              {/* TODO: show machine art here eventually */}
              <span className="rack-slot-name">{machine?.name ?? placed.machineId}</span>
              <span className={placed.online ? 'status-online rack-slot-status' : 'status-offline rack-slot-status'}>
                {placed.online ? '●' : '○'}
              </span>
              {placed.online && placed.failureThreshold != null && (
                <span className="rack-slot-stability" title="turns until failure">
                  {turns_left}t
                </span>
              )}
              {!placed.online && placed.failureThreshold != null && (
                <span className="rack-slot-repair-badge">REPAIR</span>
              )}
              <button
                className="rack-slot-remove"
                onClick={(e) => { e.stopPropagation(); onRemove(placed.instanceId) }}
                title="Remove"
              >×</button>
            </>
          ) : (
            <span className="rack-slot-empty-label">+</span>
          )}
        </button>
      )
    }
  }

  return (
    <section className="rack" style={{ backgroundImage: "url('/quota-machine/sprites/backdrop/Warehousebackdrop.png')" }}>
      <h2>The Rack{pendingInstanceId ? ' — click a slot to place' : ''}</h2>
      <div className="rack-grid" style={{ '--rack-cols': RACK_COLS }}>
        {slots}
      </div>
    </section>
  )
}
