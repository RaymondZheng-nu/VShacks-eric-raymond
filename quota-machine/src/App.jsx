import { useState } from 'react'
import { createInitialState, bringMachineOnline } from './game/gameState'
import { advanceTurn } from './game/turn'
import { getMachineById } from './data/machines'
import { getPuzzleById } from './data/puzzles'
import QuotaBar from './components/QuotaBar.jsx'
import DebtCounter from './components/DebtCounter.jsx'
import StaminaCounter from './components/StaminaCounter.jsx'
import Shop from './components/Shop.jsx'
import MachineYard from './components/MachineYard.jsx'
import TurnControls from './components/TurnControls.jsx'
import CircuitEditor from './components/CircuitEditor/CircuitEditor.jsx'

// Root component: owns the single source of truth (gameState) and passes
// it down as props. Child components should never mutate game rules
// themselves — they call into game/ (via the handlers below) and engine/
// (via CircuitEditor) only.
export default function App() {
  const [state, setState] = useState(createInitialState)
  const [solvingInstanceId, setSolvingInstanceId] = useState(null)

  function handleEndTurn() {
    setState((prev) => advanceTurn(prev))
  }

  function handleSolved() {
    setState((prev) => bringMachineOnline(prev, solvingInstanceId))
    setSolvingInstanceId(null)
  }

  const solvingMachine = state.ownedMachines.find((m) => m.instanceId === solvingInstanceId)
  const solvingPuzzle = solvingMachine
    ? getPuzzleById(getMachineById(solvingMachine.machineId)?.puzzleId)
    : null

  return (
    <div className="app">
      <header className="app-header">
        <h1>Quota Machine</h1>
      </header>

      <main className="app-main">
        <QuotaBar quotaProgress={state.quotaProgress} quotaRequired={state.quotaRequired} />
        <DebtCounter debt={state.debt} debtCutoff={state.debtCutoff} isGameOver={state.isGameOver} />
        <StaminaCounter stamina={state.stamina} maxStamina={state.maxStamina} />

        <Shop credits={state.credits} state={state} setState={setState} />
        <MachineYard
          ownedMachines={state.ownedMachines}
          connections={state.connections}
          onSelectMachine={(owned) => setSolvingInstanceId(owned.instanceId)}
        />

        {solvingPuzzle && (
          <CircuitEditor
            puzzle={solvingPuzzle}
            gameState={state}
            setGameState={setState}
            onSolved={handleSolved}
            onCancel={() => setSolvingInstanceId(null)}
          />
        )}

        {/* TODO: machine-to-machine connection puzzles for synergy bonuses —
            select two owned machines, open CircuitEditor with the synergy's
            puzzleId, call gameState.addConnection() on solve */}

        <TurnControls turn={state.turn} onEndTurn={handleEndTurn} disabled={state.isGameOver} />
      </main>
    </div>
  )
}
