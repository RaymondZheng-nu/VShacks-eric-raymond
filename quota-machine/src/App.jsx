import { useState } from 'react'
import { createInitialState, bringMachineOnline, QUOTA_CHECK_DAY, DAY_NAMES } from './game/gameState'
import { advanceTurn } from './game/turn'
import { generateDailyTasks, resolveTaskManually } from './game/tasks'
import { generateShopOffers, rerollShop } from './game/shop'
import { getMachineById } from './data/machines'
import { getPuzzleById } from './data/puzzles'
import TaskList from './components/TaskList.jsx'
import DaySummary from './components/DaySummary.jsx'
import PlayerSprite from './components/PlayerSprite.jsx'
import Taskbar from './components/Taskbar.jsx'
import RevenueBar from './components/RevenueBar.jsx'
import MachineShelf from './components/MachineShelf.jsx'
import Modal from './components/Modal.jsx'
import Shop from './components/Shop.jsx'
import MachineYard from './components/MachineYard.jsx'
import StatsPanel from './components/StatsPanel.jsx'
import JournalPanel from './components/JournalPanel.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import CircuitEditor from './components/CircuitEditor/CircuitEditor.jsx'

const BACKGROUND = '/quota-machine/sprites/backdrop/Warehousebackdrop.png'

// root component: owns game state and passes it to children
export default function App() {
  const [state, setState] = useState(() => {
    const s = createInitialState()
    return { ...s, tasks: generateDailyTasks(s), shopOffers: generateShopOffers() }
  })
  const [solvingInstanceId, setSolvingInstanceId] = useState(null)
  const [activePanel, setActivePanel] = useState(null)

  // end of day — triggers scoring, failure ticks, new tasks
  function handleEndTurn() {
    setState((prev) => advanceTurn(prev))
  }

  // brings the solved machine online
  function handleSolved() {
    // console.log('machine online:', solvingInstanceId)
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

  // re-rolls shop offers if credits allow
  function handleReroll() {
    setState((prev) => {
      const { state: next, error } = rerollShop(prev)
      return error ? prev : next
    })
  }

  function togglePanel(key) {
    setActivePanel((prev) => (prev === key ? null : key))
  }

  const solvingMachine = state.ownedMachines.find((m) => m.instanceId === solvingInstanceId) // solvingMachine might be undefined if instanceId is stale, that's fine
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
      <div className="game-canvas" style={{ backgroundImage: `url(${BACKGROUND})` }}>
        <RevenueBar credits={state.credits} />
        <MachineShelf ownedMachines={state.ownedMachines} onSolve={setSolvingInstanceId} />

        <div className="hud-topleft">
          <p className="hud-day-info">{DAY_NAMES[state.dayOfWeek - 1]}, Week {state.week}</p>
          <TaskList tasks={state.tasks} stamina={state.stamina} onResolve={handleResolveTask} />
        </div>

        <Taskbar
          activePanel={activePanel}
          onSelectPanel={togglePanel}
          onEndTurn={handleEndTurn}
          endTurnLabel={state.dayOfWeek === QUOTA_CHECK_DAY ? 'End Week (Quota Check)' : 'End Day'}
          endTurnDisabled={state.isGameOver}
        />

        {activePanel === 'shop' && (
          <Modal title="Shop" onClose={() => setActivePanel(null)}>
            <Shop
              credits={state.credits}
              week={state.week}
              shopOffers={state.shopOffers}
              state={state}
              setState={setState}
              onReroll={handleReroll}
            />
          </Modal>
        )}
        {activePanel === 'machines' && (
          <Modal title="Machines" onClose={() => setActivePanel(null)}>
            <MachineYard ownedMachines={state.ownedMachines} onSolve={setSolvingInstanceId} />
          </Modal>
        )}
        {activePanel === 'stats' && (
          <Modal title="Stats" onClose={() => setActivePanel(null)}>
            <StatsPanel
              quotaProgress={state.quotaProgress}
              quotaRequired={state.quotaRequired}
              week={state.week}
              dayOfWeek={state.dayOfWeek}
              stamina={state.stamina}
              maxStamina={state.maxStamina}
            />
          </Modal>
        )}
        {activePanel === 'journal' && <JournalPanel onClose={() => setActivePanel(null)} />}
        {activePanel === 'settings' && <SettingsPanel onClose={() => setActivePanel(null)} />}

        {/* TODO: machine-to-machine connection puzzles for synergy bonuses —
            select two owned machines, open CircuitEditor with the synergy's
            puzzleId, call gameState.addConnection() on solve */}

        {solvingPuzzle && (
          <div className="circuit-editor-overlay">
            <CircuitEditor
              puzzle={solvingPuzzle}
              isRepair={isRepair}
              gameState={state}
              setGameState={setState}
              onSolved={handleSolved}
              onCancel={() => setSolvingInstanceId(null)}
            />
          </div>
        )}

        <DaySummary summary={state.lastDaySummary} />
      </div>

      <PlayerSprite quotaProgress={state.quotaProgress} quotaRequired={state.quotaRequired} />
    </div>
  )
}
