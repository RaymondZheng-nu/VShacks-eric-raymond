import { MACHINES } from '../data/machines'
import { TASK_TYPES } from '../data/tasks'
import { buyMachine, scaledCost, REROLL_COST } from '../game/shop'

// renders shop with offers tooltips and reroll
export default function Shop({ credits, week, shopOffers, state, setState, onReroll, pushFloatingText }) {
  // attempts to buy a machine surfaces errors to console
  function handleBuy(machineId) {
    const { state: nextState, error } = buyMachine(state, machineId)
    if (error) {
      console.warn('buyMachine failed:', error)
      return
    }
    pushFloatingText(`-${state.credits - nextState.credits} credits`, 85, 12, 'red')
    setState(nextState)
  }

  const machinesToShow = shopOffers && shopOffers.length > 0
    ? MACHINES.filter((m) => shopOffers.includes(m.id))
    : MACHINES

  return (
    <section className="shop">
      <h2>Shop ({credits} credits)</h2>
      <ul className="shop-list">
        {machinesToShow.map((machine) => {
          const cost = scaledCost(machine, week ?? 1)
          const automatesTask = TASK_TYPES.find((t) => t.automationMachineId === machine.id)
          // todo show rarity somewhere
          return (
            <li key={machine.id} className="shop-item">
              <div className="shop-item-row">
                <span>{machine.name}</span>
                <span>{cost}c</span>
                <button onClick={() => handleBuy(machine.id)} disabled={credits < cost}>
                  Buy
                </button>
              </div>
              <div className="shop-item-tooltip">
                {machine.chips > 0 && <div>+{machine.chips} chips</div>}
                {machine.multBonus > 0 && <div>+{machine.multBonus} mult</div>}
                {/* this is kind of buried in the tooltip */}
                {automatesTask && <div>automates: {automatesTask.name}</div>}
                <div>puzzle needed: {machine.puzzleId}</div>
              </div>
            </li>
          )
        })}
      </ul>
      <button onClick={onReroll} disabled={credits < REROLL_COST}>
        Re-roll ({REROLL_COST}c)
      </button>
    </section>
  )
}
