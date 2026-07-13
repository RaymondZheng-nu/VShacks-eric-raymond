import { MACHINES } from '../data/machines'
import { TASK_TYPES } from '../data/tasks'
import { buyMachine, scaledCost, REROLL_COST } from '../game/shop'
import { playPurchase } from '../audio.js'

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
    playPurchase()
    setState(nextState)
  }

  const machinesToShow = shopOffers && shopOffers.length > 0
    ? MACHINES.filter((m) => shopOffers.includes(m.id))
    : MACHINES

  const ownedCounts = {}
  ;(state.ownedMachines ?? []).forEach(m => {
    ownedCounts[m.machineId] = (ownedCounts[m.machineId] ?? 0) + 1
  })

  const discount = state.shopDiscount ?? false

  return (
    <section className="shop">
      <h2>Shop ({credits} credits)</h2>
      {discount && <div className="shop-event-banner">Bulk Deal: all prices halved today</div>}
      <ul className="shop-list">
        {machinesToShow.map((machine) => {
          const cost = scaledCost(machine, week ?? 1, discount)
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
                {ownedCounts[machine.id] > 0 && <div className="shop-owned-count">owned: {ownedCounts[machine.id]}</div>}
                {machine.countScaling && <div>stacks with duplicates</div>}
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
