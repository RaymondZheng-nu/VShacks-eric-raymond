// Shows remaining stamina for circuit-solving actions this day.
export default function StaminaCounter({ stamina, maxStamina }) {
  return (
    <section className="stamina-counter">
      <h2>Stamina</h2>
      <p>{stamina} / {maxStamina}</p>
      {stamina <= 0 && <p className="stamina-counter-empty">Out of stamina — wait for next turn</p>}
    </section>
  )
}
