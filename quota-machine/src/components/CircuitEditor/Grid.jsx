// Renders the fixed-size grid cells that gates snap into (grid-based
// placement, not freeform dragging). Cells hold either an INPUT/OUTPUT pin,
// a GateNode, or are empty; Wire components connect cell ports.
// Props: { puzzle: Puzzle }
const GRID_COLS = 6
const GRID_ROWS = 4

export default function Grid({ puzzle }) {
  // TODO: derive INPUT/OUTPUT pin cell positions from puzzle.spec.inputIds
  // / outputIds, render placed GateNode/Wire children from editor state.

  const cells = Array.from({ length: GRID_COLS * GRID_ROWS })

  return (
    <div
      className="circuit-grid"
      data-puzzle-id={puzzle?.id}
      style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
    >
      {cells.map((_, i) => (
        <div key={i} className="circuit-grid-cell" data-index={i} />
      ))}
      {/* TODO: pin layout for puzzle.spec.inputIds/outputIds + gate palette drag targets */}
    </div>
  )
}
