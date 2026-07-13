import { useState, useEffect, useRef } from 'react'
import { createInitialState, bringMachineOnline, addConnection } from './game/gameState'
import { advanceTurn } from './game/turn'
import { generateDailyTasks } from './game/tasks'
import { generateShopOffers, rerollShop, upgradeMachine } from './game/shop'
import { getMachineById } from './data/machines'
import { getTaskTypeById } from './data/tasks'
import { getPuzzleById } from './data/puzzles'
import { findSynergy } from './data/synergies'
import { resolveScore } from './engine/scoring-engine'
import { MACHINES } from './data/machines'
import { FEATURED_SYNERGIES } from './data/synergies'
import { saveGame, loadGame, clearSave, restoreInstanceCounter } from './game/persist'
import { playInstall, playQuotaPass, playQuotaFail, playMachineFail, playTask } from './audio.js'
import TaskList from './components/TaskList.jsx'
import DaySummary from './components/DaySummary.jsx'
import Taskbar from './components/Taskbar.jsx'
import RevenueBar from './components/RevenueBar.jsx'
import MachineShelf from './components/MachineShelf.jsx'
import Modal from './components/Modal.jsx'
import Shop from './components/Shop.jsx'
import MachineYard from './components/MachineYard.jsx'
import StatsPanel from './components/StatsPanel.jsx'
import JournalPanel from './components/JournalPanel.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import PuzzleBoard from './components/PuzzleBoard.jsx'
import GameOver from './components/GameOver.jsx'
import FloatingTextLayer from './components/FloatingTextLayer.jsx'
import StartScreen from './components/StartScreen.jsx'

const BACKGROUND = `${import.meta.env.BASE_URL}sprites/backdrop/Warehousebackdrop.png`
const DEFAULT_CONNECTION_PUZZLE_ID = 'and-basic'

// root component owns game state and passes it to children
export default function App() {
  const [state, setState] = useState(() => {
    const saved = loadGame()
    if (saved) {
      restoreInstanceCounter(saved)
      const patched = {
        ...saved,
        currentEvent: saved.currentEvent ?? null,
        shopDiscount: saved.shopDiscount ?? false,
      }
      const needsTasks = !patched.tasks || patched.tasks.length === 0
      const needsShop = !patched.shopOffers || patched.shopOffers.length === 0
      return {
        ...patched,
        tasks: needsTasks ? generateDailyTasks(patched) : patched.tasks,
        shopOffers: needsShop ? generateShopOffers() : patched.shopOffers,
      }
    }
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
  const [floatingTexts, setFloatingTexts] = useState([])
  const prevStaminaRef = useRef(state.stamina)
  const [staminaFlash, setStaminaFlash] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [failFlash, setFailFlash] = useState(false)
  // snapshot so install vs repair text and puzzle dont flip once bringMachineOnline sets a threshold
  const solvingIsRepairRef = useRef(false)

  // save game state on every state change (except game over — clear save instead)
  useEffect(() => {
    if (state.isGameOver) {
      clearSave()
    } else {
      saveGame(state)
    }
  }, [state])

  // auto-clears transient connect-mode messages ("Machine must be online", "Already connected")
  useEffect(() => {
    if (!connectMessage) return
    const timer = setTimeout(() => setConnectMessage(null), 2000)
    return () => clearTimeout(timer)
  }, [connectMessage])

  // sweeps out floating texts once their rise/fade animation has finished
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingTexts((prev) => prev.filter((ft) => Date.now() - ft.createdAt < 1500))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // briefly flashes the HUD stamina counter whenever stamina drops
  useEffect(() => {
    if (state.stamina < prevStaminaRef.current) {
      setStaminaFlash(true)
      const timer = setTimeout(() => setStaminaFlash(false), 300)
      prevStaminaRef.current = state.stamina
      return () => clearTimeout(timer)
    }
    prevStaminaRef.current = state.stamina
  }, [state.stamina])

  // spawns a floating chip/feedback label at a percentage-coordinate position
  function pushFloatingText(text, x, y, color) {
    setFloatingTexts((prev) => [...prev, { id: Date.now() + Math.random(), text, x, y, color, createdAt: Date.now() }])
  }

  // advances the game by one day, and shows machine income if any was earned
  function handleEndTurn() {
    const prevOnline = new Set(state.ownedMachines.filter(m => m.online).map(m => m.instanceId))
    const next = advanceTurn(state)
    if (next.lastDaySummary?.dailyCredits > 0) {
      pushFloatingText(`+${next.lastDaySummary.dailyCredits}`, 85, 12, 'green')
    }
    if (next.lastDaySummary?.quotaPassed === true) {
      playQuotaPass()
    } else if (next.lastDaySummary?.quotaPassed === false) {
      playQuotaFail()
      setFailFlash(true)
      setTimeout(() => setFailFlash(false), 700)
    }
    const newlyFailed = next.ownedMachines.filter(m => !m.online && prevOnline.has(m.instanceId))
    if (newlyFailed.length > 0) playMachineFail()
    setState(next)
  }

  // opens the install or repair puzzle for a machine, snapshots repair status before it can change
  function handleOpenMachinePuzzle(instanceId) {
    const m = state.ownedMachines.find((om) => om.instanceId === instanceId)
    solvingIsRepairRef.current = m != null && m.failureThreshold != null
    setSolvingInstanceId(instanceId)
  }

  // brings solved machine online, modal stays open so the completion screen can show first
  function handleSolved() {
    // console.log('machine online:', solvingInstanceId)
    setState((prev) => bringMachineOnline(prev, solvingInstanceId))
    playInstall()
    pushFloatingText('-1 stamina', 15, 22, 'blue')
  }

  // name is wrong, this opens the puzzle modal not a manual resolve — TODO rename
  function handleStartTask(taskId) {
    setSolvingTaskId(taskId)
  }

  // puzzle solved: puzzle board already spent the stamina, so just mark the task done
  // modal stays open so the completion screen can show first, dismiss closes it after
  function handleTaskSolved() {
    const task = state.tasks.find((t) => t.id === solvingTaskId)
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === solvingTaskId ? { ...t, done: true } : t)),
      totalTasksCompleted: (prev.totalTasksCompleted ?? 0) + 1,
    }))
    playTask()
    if (task) pushFloatingText(`+${task.output} chips`, 15, 30, 'green')
    pushFloatingText('-1 stamina', 15, 22, 'blue')
  }

  // spends credits to level up an owned machine, and shows the cost spent
  function handleUpgradeMachine(instanceId) {
    const next = upgradeMachine(state, instanceId)
    const cost = state.credits - next.credits
    if (cost > 0) pushFloatingText(`-${cost} credits`, 85, 12, 'red')
    setState(next)
  }

  // resets to a fresh run, this would be 2 lines with a reducer but here we are
  function handleRestart() {
    clearSave()
    const s = createInitialState()
    setState({ ...s, tasks: generateDailyTasks(s), shopOffers: generateShopOffers() })
    setSolvingInstanceId(null)
    setSolvingTaskId(null)
    setActivePanel(null)
    setConnectingMode(false)
    setSelectedMachineA(null)
    setConnectingPuzzlePair(null)
    setConnectMessage(null)
  }

  // toggles connection mode; closes any open modal so the shelf is clickable
  function handleToggleConnectMode() {
    setActivePanel(null)
    setConnectingMode((prev) => !prev)
    setSelectedMachineA(null)
    setConnectMessage(null)
  }

  // shelf click handler in connect mode — ended up doing more than expected
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

  // puzzle solved: puzzle board already spent the stamina, so just register the connection
  // modal stays open so the completion screen can show first, dismiss closes it after
  function handleConnectionSolved() {
    setState((prev) => addConnection(prev, connectingPuzzlePair.aId, connectingPuzzlePair.bId))
    pushFloatingText('-1 stamina', 15, 22, 'blue')
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

  // game state is already initialized above; this just gates what's rendered
  if (!gameStarted) {
    return <StartScreen onStart={() => setGameStarted(true)} />
  }

  const solvingMachine = state.ownedMachines.find((m) => m.instanceId === solvingInstanceId) // might be undefined if stale
  // use harder repair puzzle if machine had already failed before this puzzle was opened
  // snapshotted in the ref so it cant flip mid solve once bringMachineOnline sets a threshold
  const isRepair = solvingIsRepairRef.current
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

  const previewScore = resolveScore({
    ownedMachines: state.ownedMachines,
    connections: state.connections,
    tasks: state.tasks,
    partCatalog: MACHINES,
    synergyCatalog: FEATURED_SYNERGIES,
  })

  // label and reward text for the completion screen, whichever of the three flows is active
  let completeLabel = ''
  let completeResult = 'No reward'
  if (machinePuzzle) {
    const machineName = getMachineById(solvingMachine.machineId)?.name ?? 'Machine'
    completeLabel = isRepair ? 'Machine repaired' : `${machineName} online`
  } else if (taskPuzzle) {
    completeLabel = solvingTask?.name ?? 'Task complete'
    completeResult = solvingTask ? `+${solvingTask.output} chips` : 'No reward'
  } else if (connectingPuzzlePair) {
    completeLabel = 'Connection established'
  }

  // actually closes the puzzle board once the completion screen is dismissed, mirrors onCancel below
  function handleCircuitCompleteDismiss() {
    if (machinePuzzle) setSolvingInstanceId(null)
    else if (taskPuzzle) setSolvingTaskId(null)
    else {
      setConnectingPuzzlePair(null)
      setConnectingMode(false)
      setSelectedMachineA(null)
    }
  }

  return (
    <div className="app">
      <div className="game-canvas" style={{ backgroundImage: `url(${BACKGROUND})` }}>
        {failFlash && <div className="quota-fail-flash" />}
        <FloatingTextLayer floatingTexts={floatingTexts} />
        <RevenueBar credits={state.credits} />
        <MachineShelf
          ownedMachines={state.ownedMachines}
          onSolve={handleOpenMachinePuzzle}
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
          <p className="hud-day-info">Day {state.day}</p>
          <p className={`hud-stamina-info${staminaFlash ? ' hud-stamina-info--flash' : ''}${state.stamina <= 0 ? ' hud-stamina-info--empty' : ''}`}>
            Stamina: {state.stamina}/{state.maxStamina}
          </p>
          <p className="hud-score-preview">{previewScore.chips} chips × {Number.isInteger(previewScore.mult) ? previewScore.mult : previewScore.mult.toFixed(2)} = <strong>{previewScore.total}</strong> pts</p>
          <TaskList tasks={state.tasks} stamina={state.stamina} onResolve={handleStartTask} />
        </div>

        <Taskbar
          activePanel={activePanel}
          onSelectPanel={togglePanel}
          onEndTurn={handleEndTurn}
          endTurnLabel={'End Day (Quota Check)'}
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
              pushFloatingText={pushFloatingText}
            />
          </Modal>
        )}
        {activePanel === 'machines' && (
          <Modal title="Machines" onClose={() => setActivePanel(null)}>
            <MachineYard
              ownedMachines={state.ownedMachines}
              onSolve={handleOpenMachinePuzzle}
              onEnterConnectMode={handleToggleConnectMode}
              credits={state.credits}
              onUpgrade={handleUpgradeMachine}
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
              day={state.day}
              stamina={state.stamina}
              maxStamina={state.maxStamina}
              credits={state.credits}
              debt={state.debt}
              ownedMachines={state.ownedMachines}
              connections={state.connections}
            />
          </Modal>
        )}
        {activePanel === 'journal' && <JournalPanel onClose={() => setActivePanel(null)} />}
        {activePanel === 'settings' && <SettingsPanel onClose={() => setActivePanel(null)} />}

        {solvingPuzzle && (
          <div className="circuit-editor-overlay">
            <PuzzleBoard
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
              onDismiss={handleCircuitCompleteDismiss}
              completeLabel={completeLabel}
              completeResult={completeResult}
            />
          </div>
        )}

        <DaySummary summary={state.lastDaySummary} />
      </div>

      {state.isGameOver && <GameOver state={state} onRestart={handleRestart} />}
    </div>
  )
}
