// full-screen shutdown screen shown when state.isGameOver is true
export default function GameOver({ state, onRestart }) {
  const machinesOnline = state.ownedMachines.filter((m) => m.online).length

  return (
    <div className="game-over-overlay">
      <div className="game-over-panel">
        <h1 className="game-over-header">SHUTDOWN</h1>
        <ul className="game-over-stats">
          <li><span>Weeks survived</span><span>{state.week}</span></li>
          <li><span>Final credits</span><span>{state.credits}</span></li>
          <li><span>Machines owned</span><span>{state.ownedMachines.length}</span></li>
          <li><span>Machines online</span><span>{machinesOnline}</span></li>
          <li><span>Active connections</span><span>{state.connections.length}</span></li>
          <li><span>Tasks completed</span><span>{state.totalTasksCompleted}</span></li>
        </ul>
        <button className="game-over-restart" onClick={onRestart}>Try Again</button>
      </div>
    </div>
  )
}
