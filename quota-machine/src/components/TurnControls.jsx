// Turn counter + "End Turn" button, which calls game/turn.js's
// advanceTurn() (via App.jsx's handleEndTurn).
// Props: { turn: number, onEndTurn: () => void, disabled: boolean }
export default function TurnControls({ turn, onEndTurn, disabled }) {
  return (
    <section className="turn-controls">
      <h2>Turn {turn}</h2>
      <button onClick={onEndTurn} disabled={disabled}>
        End Turn
      </button>
      {/* TODO: confirmation if machines are still offline / unsolved this turn */}
    </section>
  )
}
