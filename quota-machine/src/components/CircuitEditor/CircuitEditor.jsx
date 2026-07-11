import Grid from './Grid.jsx'
import { validateCircuit } from '../../engine/circuit-engine.js'
import { spendStamina } from '../../game/turn.js'

// Top-level circuit puzzle editor: renders a grid-based (not freeform)
// gate-placement + wire-connection surface, and validates the player's
// circuit against a puzzle spec via engine/circuit-engine.js. A passing
// solve (powering a machine or connecting two machines) costs 1 stamina,
// via game/turn.js's spendStamina — buying/upgrading machines never goes
// through here and is never stamina-gated.
// Props:
//   puzzle: Puzzle (from data/puzzles.js)
//   gameState: GameState — read for current stamina
//   setGameState: (state) => void — called with the post-spend state on a pass
//   onSolved: () => void — called once the solve is validated AND stamina spent
//   onCancel: () => void
export default function CircuitEditor({ puzzle, gameState, setGameState, onSolved, onCancel }) {
  // TODO: local state for placed gates/wires (grid cell -> node), selected
  // palette gate, and the last validateCircuit() result to show
  // failedRow feedback to the player.

  function handleCheck() {
    if (gameState.stamina <= 0) {
      // TODO: surface a "out of stamina, wait for next turn" UI state
      // instead of just logging.
      console.warn('handleCheck blocked: out of stamina')
      return
    }

    // TODO: build playerNodes from local grid state once gate placement
    // and wiring are implemented; this is a stand-in until then.
    const playerNodes = []
    const result = validateCircuit(playerNodes, puzzle.spec)

    if (!result.pass) {
      // TODO: show result.failedRow feedback to the player.
      return
    }

    const spend = spendStamina(gameState)
    if (!spend.ok) {
      // TODO: surface a "out of stamina, wait for next turn" UI state
      // instead of just logging.
      console.warn('handleCheck blocked: out of stamina')
      return
    }

    setGameState(spend.state)
    onSolved()
  }

  return (
    <div className="circuit-editor">
      <h2>{puzzle?.name ?? 'Circuit Puzzle'}</h2>
      <p>{puzzle?.description}</p>

      <Grid puzzle={puzzle} />

      <div className="circuit-editor-actions">
        <button onClick={handleCheck}>Check Circuit</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
