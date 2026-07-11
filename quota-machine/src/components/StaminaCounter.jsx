// Shows remaining stamina — the budget for circuit-solving actions
// (powering/connecting machines) this turn. Resets to maxStamina at the
// start of every turn via game/turn.js's advanceTurn(). Buying/upgrading
// machines is money-only and never spends stamina.
// Props: { stamina: number, maxStamina: number }
export default function StaminaCounter({ stamina, maxStamina }) {
  return (
    <section className="stamina-counter">
      <h2>Stamina</h2>
      <p>
        {stamina} / {maxStamina}
      </p>
      {stamina <= 0 && <p className="stamina-counter-empty">Out of stamina — wait for next turn</p>}
    </section>
  )
}
