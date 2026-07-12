import { useState, useEffect } from 'react'
import { createInitialState, bringMachineOnline, addConnection, QUOTA_CHECK_DAY, DAY_NAMES } from './game/gameState'
import { advanceTurn } from './game/turn'
import { generateDailyTasks } from './game/tasks'
import { generateShopOffers, rerollShop } from './game/shop'
import { getMachineById } from './data/machines'
import { getTaskTypeById } from './data/tasks'
import { getPuzzleById } from './data/puzzles'
import { findSynergy } from './data/synergies'
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
const DEFAULT_CONNECTION_PUZZLE_ID = 'and-basic'

// root component owns game state and passes it to children
export default function App() {
  const [state, setState] = useState(() => {
    const s = createInitialState()
    return { ...s, tasks: generateDailyTasks(s), shopOffers: generateShopOffers() }
  })
  const [solvingInstanceId, setSolvingInstanceId] = useState(null)
  const [solvingTaskId, setSolvingTaskId] = useState(null)
  const [activePanel, setActivePanel] = useState(null)
  const [connectingMode, setConnectingMode] = useState(false)
  const [selectedMachineA, setSelectedMachineA] = useState(null)
  // set once two valid online machines are picked; gates the third CircuitEditor entry point
  const [connectingPuzzlePair, setConnectingPuzzlePair] = useState(null)
  const [connectMessage, setConnectMessage] = useState(null)

  // auto-clears transient connect-mode messages ("Machine must be online", "Already connected")
  useEffect(() => {
    if (!connectMessage) return
    const timer = setTimeout(() => setConnectMessage(null), 2000)
    return () => clearTimeout(timer)
  }, [connectMessage])

  // advances the game by one day
  function handleEndTurn() {
    setState((prev) => advanceTurn(prev))
  }

  // brings solved machine online
  function handleSolved() {
    // console.log('machine online:', solvingInstanceId)
    setState((prev) => bringMachineOnline(prev, solvingInstanceId))
    setSolvingInstanceId(null)
  }

  // opens the circuit puzzle for a task instead of insta-completing it
  function handleStartTask(taskId) {
    setSolvingTaskId(taskId)
  }

  // puzzle solved: CircuitEditor already spent the stamina, so just mark the task done and close
  function handleTaskSolved() {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === solvingTaskId ? { ...t, done: true } : t)),
    }))
    setSolvingTaskId(null)
  }

  // toggles connection mode; closes any open modal so the shelf is clickable
  function handleToggleConnectMode() {
    setActivePanel(null)
    setConnectingMode((prev) => !prev)
    setSelectedMachineA(null)
    setConnectMessage(null)
  }

  // handles a shelf-machine click while in connection mode
  function handleConnectClick(owned) {
    if (!owned.online) {
      setConnectMessage('Machine must be online')
      setConnectingMode(false)
      setSelectedMachineA(null)
      return
    }
    if (selectedMachineA === null) {
      setSelectedMachineA(owned.instanceId)
      return
    }
    if (selectedMachineA === owned.instanceId) {
      setSelectedMachineA(null)
      return
    }
    const alreadyConnected = state.connections.some(
      (c) => c.machineInstanceIds.includes(selectedMachineA) && c.machineInstanceIds.includes(owned.instanceId)
    )
    if (alreadyConnected) {
      setConnectMessage('Already connected')
      setSelectedMachineA(null)
      return
    }
    setConnectingPuzzlePair({ aId: selectedMachineA, bId: owned.instanceId })
  }

  // puzzle solved: CircuitEditor already spent the stamina, so just register the connection and close
  function handleConnectionSolved() {
    setState((prev) => addConnection(prev, connectingPuzzlePair.aId, connectingPuzzlePair.bId))
    setConnectingPuzzlePair(null)
    setConnectingMode(false)
    setSelectedMachineA(null)
  }

  // cancels the connection puzzle: close modal, exit connection mode, no state changes
  function handleConnectionCancel() {
    setConnectingPuzzlePair(null)
    setConnectingMode(false)
    setSelectedMachineA(null)
  }

  // rerolls shop offers if credits allow
  function handleReroll() {
    setState((prev) => {
      const { state: next, error } = rerollShop(prev)
      return error ? prev : next
    })
  }

  function togglePanel(key) {
    setActivePanel((prev) => (prev === key ? null : key))
  }

  const solvingMachine = state.ownedMachines.find((m) => m.instanceId === solvingInstanceId) // might be undefined if stale
  // use harder repair puzzle if machine has failed before
  const isRepair = solvingMachine != null && solvingMachine.failureThreshold != null
  const machinePuzzle = solvingMachine
    ? getPuzzleById(
        isRepair
          ? getMachineById(solvingMachine.machineId)?.repairPuzzleId
          : getMachineById(solvingMachine.machineId)?.puzzleId
      )
    : null

  // second CircuitEditor entry point: solving a task's puzzle instead of installing/repairing a machine
  const solvingTask = state.tasks.find((t) => t.id === solvingTaskId)
  const taskPuzzle = solvingTask ? getPuzzleById(getTaskTypeById(solvingTask.typeId)?.puzzleId) : null

  // third CircuitEditor entry point: connecting two online machines for a synergy bonus
  const connectingMachineA = connectingPuzzlePair
    ? state.ownedMachines.find((m) => m.instanceId === connectingPuzzlePair.aId)
    : null
  const connectingMachineB = connectingPuzzlePair
    ? state.ownedMachines.find((m) => m.instanceId === connectingPuzzlePair.bId)
    : null
  const connectionSynergy = connectingMachineA && connectingMachineB
    ? findSynergy(connectingMachineA.machineId, connectingMachineB.machineId)
    : null
  const connectionPuzzle = connectingPuzzlePair
    ? getPuzzleById(connectionSynergy?.puzzleId ?? DEFAULT_CONNECTION_PUZZLE_ID)
    : null

  const solvingPuzzle = machinePuzzle ?? taskPuzzle ?? connectionPuzzle

  return (
    <div className="app">
      <div className="game-canvas" style={{ backgroundImage: `url(${BACKGROUND})` }}>
        <RevenueBar credits={state.credits} />
        <MachineShelf
          ownedMachines={state.ownedMachines}
          onSolve={setSolvingInstanceId}
          connectingMode={connectingMode}
          selectedMachineA={selectedMachineA}
          onConnectClick={handleConnectClick}
          connections={state.connections}
        />
        {connectingMode && (
          <div className="connect-banner">
            <span>
              {connectMessage ?? (selectedMachineA ? 'Select the second online machine' : 'Select the first online machine')}
            </span>
            <button onClick={handleToggleConnectMode}>Cancel</button>
          </div>
        )}

        <div className="hud-topleft">
          <p className="hud-day-info">{DAY_NAMES[state.dayOfWeek - 1]}, Week {state.week}</p>
          <p className="hud-stamina-info">Stamina: {state.stamina}/{state.maxStamina}</p>
          <TaskList tasks={state.tasks} stamina={state.stamina} onResolve={handleStartTask} />
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
            <MachineYard
              ownedMachines={state.ownedMachines}
              onSolve={setSolvingInstanceId}
              onEnterConnectMode={handleToggleConnectMode}
            />
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

        {solvingPuzzle && (
          <div className="circuit-editor-overlay">
            <CircuitEditor
              puzzle={solvingPuzzle}
              isRepair={machinePuzzle != null && isRepair}
              gameState={state}
              setGameState={setState}
              onSolved={machinePuzzle ? handleSolved : taskPuzzle ? handleTaskSolved : handleConnectionSolved}
              onCancel={() => {
                if (machinePuzzle) setSolvingInstanceId(null)
                else if (taskPuzzle) setSolvingTaskId(null)
                else handleConnectionCancel()
              }}
            />
          </div>
        )}

        <DaySummary summary={state.lastDaySummary} />
      </div>

      <PlayerSprite quotaProgress={state.quotaProgress} quotaRequired={state.quotaRequired} />
    </div>
  )
}
