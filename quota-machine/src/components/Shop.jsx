import { MACHINES } from '../data/machines'
import { buyMachine } from '../game/shop'

// Lists purchasable machines and buys them via game/shop.js.
// Props: { credits: number, state: GameState, setState: (fn) => void }
export default function Shop({ credits, state, setState }) {
  function handleBuy(machineId) {
    const { state: nextState, error } = buyMachine(state, machineId)
    if (error) {
      // TODO: surface purchase errors (insufficient credits) in the UI
      console.warn('buyMachine failed:', error)
      return
    }
    setState(nextState)
  }

  return (
    <section className="shop">
      <h2>Shop ({credits} credits)</h2>
      <ul className="shop-list">
        {MACHINES.map((machine) => (
          <li key={machine.id} className="shop-item">
            <span>{machine.name}</span>
            <span>{machine.cost}c</span>
            <button onClick={() => handleBuy(machine.id)} disabled={credits < machine.cost}>
              Buy
            </button>
          </li>
        ))}
      </ul>
      {/* TODO: machine art (artKey), tooltips describing baseOutput/puzzle */}
    </section>
  )
}
