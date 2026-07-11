import { useState } from 'react'
import { createInitialState } from './game/gameState'
import { advanceTurn } from './game/turn'
import QuotaBar from './components/QuotaBar.jsx'
import DebtCounter from './components/DebtCounter.jsx'
import StaminaCounter from './components/StaminaCounter.jsx'
import Shop from './components/Shop.jsx'
import MachineYard from './components/MachineYard.jsx'
import TurnControls from './components/TurnControls.jsx'

// Root component: owns the single source of truth (gameState) and passes
// it down as props. Child components should never mutate game rules
// themselves — they call into game/ (via the handlers below) and engine/
// (via CircuitEditor) only.
export default function App() {
  const [state, setState] = useState(createInitialState)

  function handleEndTurn() {
    setState((prev) => advanceTurn(prev))
  }

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
        <MachineYard ownedMachines={state.ownedMachines} connections={state.connections} setState={setState} />

        {/* TODO: mount CircuitEditor here when a machine/connection puzzle is
            selected, passing gameState={state} setGameState={setState} */}

        <TurnControls turn={state.turn} onEndTurn={handleEndTurn} disabled={state.isGameOver} />
      </main>
    </div>
  )
}
