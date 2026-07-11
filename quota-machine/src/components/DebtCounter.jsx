// Shows accumulated debt against the loss-condition cutoff.
// Props: { debt: number, debtCutoff: number, isGameOver: boolean }
export default function DebtCounter({ debt, debtCutoff, isGameOver }) {
  return (
    <section className="debt-counter">
      <h2>Debt</h2>
      <p>
        {debt} / {debtCutoff}
      </p>
      {isGameOver && <p className="debt-counter-game-over">GAME OVER — debt cutoff reached</p>}
      {/* TODO: warning styling as debt approaches cutoff */}
    </section>
  )
}
