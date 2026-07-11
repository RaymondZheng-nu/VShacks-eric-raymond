import { useState } from 'react'
import { createInitialState, bringMachineOnline } from './game/gameState'
import { placeMachine, removeMachineFromRack } from './game/rack'
import { advanceTurn } from './game/turn'
import { generateDailyTasks, resolveTaskManually } from './game/tasks'
import { generateShopOffers, rerollShop } from './game/shop'
import { getMachineById } from './data/machines'
import { getPuzzleById } from './data/puzzles'
import QuotaBar from './components/QuotaBar.jsx'
import DebtCounter from './components/DebtCounter.jsx'
import StaminaCounter from './components/StaminaCounter.jsx'
import TaskList from './components/TaskList.jsx'
import Shop from './components/Shop.jsx'
import MachineYard from './components/MachineYard.jsx'
import Rack from './components/Rack.jsx'
import TurnControls from './components/TurnControls.jsx'
import CircuitEditor from './components/CircuitEditor/CircuitEditor.jsx'
import PlayerSprite from './components/PlayerSprite.jsx'
import DaySummary from './components/DaySummary.jsx'

// root component: owns game state and passes it to children
export default function App() {
  const [state, setState] = useState(() => {
    const s = createInitialState()
    return { ...s, tasks: generateDailyTasks(s), shopOffers: generateShopOffers() }
  })
  const [solvingInstanceId, setSolvingInstanceId] = useState(null)
  const [pendingPlacement, setPendingPlacement] = useState(null)

  // advances the game by one day
  function handleEndTurn() {
    setState((prev) => advanceTurn(prev))
  }

  // brings the solved machine online
  function handleSolved() {
    setState((prev) => bringMachineOnline(prev, solvingInstanceId))
    setSolvingInstanceId(null)
  }

  // resolves a task manually spending stamina
  function handleResolveTask(taskId) {
    setState((prev) => {
      const result = resolveTaskManually(prev, taskId)
      return result.ok ? result.state : prev
    })
  }

  // sets a machine as pending placement
  function handleSelectInventory(instanceId) {
    setPendingPlacement(instanceId)
    setSolvingInstanceId(null)
  }

  // places the pending machine into the clicked rack slot
  function handleRackSlotClick(row, col) {
    if (!pendingPlacement) return
    setState((prev) => {
      const result = placeMachine(prev, pendingPlacement, row, col)
      return result.ok ? result.state : prev
    })
    setPendingPlacement(null)
  }

  // handles clicking a filled rack slot: swaps or opens puzzle
  function handleRackMachineClick(owned) {
    if (pendingPlacement) {
      // TODO: this swap feels clunky, maybe show a confirm or animation
      setState((prev) => {
        const withRemoved = removeMachineFromRack(prev, owned.instanceId)
        const result = placeMachine(withRemoved, pendingPlacement, owned.position.row, owned.position.col)
        return result.ok ? result.state : prev
      })
      setPendingPlacement(null)
      return
    }
    if (!owned.online) setSolvingInstanceId(owned.instanceId)
  }

  // removes a machine from the rack back to inventory
  function handleRemoveFromRack(instanceId) {
    setState((prev) => removeMachineFromRack(prev, instanceId))
  }

  // re-rolls shop offers if credits allow
  function handleReroll() {
    setState((prev) => {
      const { state: next, error } = rerollShop(prev)
      return error ? prev : next
    })
  }

  const solvingMachine = state.ownedMachines.find((m) => m.instanceId === solvingInstanceId)
  // use harder repair puzzle if the machine has failed before (failureThreshold gets set on first activation)
  const isRepair = solvingMachine != null && solvingMachine.failureThreshold != null
  const solvingPuzzle = solvingMachine
    ? getPuzzleById(
        isRepair
          ? getMachineById(solvingMachine.machineId)?.repairPuzzleId
          : getMachineById(solvingMachine.machineId)?.puzzleId
      )
    : null

  return (
    <div className="app">
      <header className="app-header">
        <h1>Quota Machine</h1>
      </header>

      <main className="app-main">
        <QuotaBar quotaProgress={state.quotaProgress} quotaRequired={state.quotaRequired} />
        <DebtCounter week={state.week} dayOfWeek={state.dayOfWeek} />
        <StaminaCounter stamina={state.stamina} maxStamina={state.maxStamina} />
        <TaskList tasks={state.tasks} stamina={state.stamina} onResolve={handleResolveTask} />
        <DaySummary summary={state.lastDaySummary} />

        <Shop
          credits={state.credits}
          week={state.week}
          shopOffers={state.shopOffers}
          state={state}
          setState={setState}
          onReroll={handleReroll}
        />
        <MachineYard
          ownedMachines={state.ownedMachines}
          selectedInstanceId={pendingPlacement}
          onSelect={handleSelectInventory}
        />
        <Rack
          ownedMachines={state.ownedMachines}
          pendingInstanceId={pendingPlacement}
          onSlotClick={handleRackSlotClick}
          onMachineClick={handleRackMachineClick}
          onRemove={handleRemoveFromRack}
        />

        {solvingPuzzle && (
          <CircuitEditor
            puzzle={solvingPuzzle}
            isRepair={isRepair}
            gameState={state}
            setGameState={setState}
            onSolved={handleSolved}
            onCancel={() => setSolvingInstanceId(null)}
          />
        )}

        {/* TODO: machine-to-machine connection puzzles for synergy bonuses —
            select two owned machines, open CircuitEditor with the synergy's
            puzzleId, call gameState.addConnection() on solve */}

        <TurnControls day={state.day} week={state.week} dayOfWeek={state.dayOfWeek} onEndTurn={handleEndTurn} disabled={state.isGameOver} />
      </main>

      <PlayerSprite quotaProgress={state.quotaProgress} quotaRequired={state.quotaRequired} />
    </div>
  )
}
