import FloatingText from './FloatingText.jsx'

// full-screen layer rendering all active floating texts, above the game, below modals
export default function FloatingTextLayer({ floatingTexts }) {
  return (
    <div className="floating-text-layer">
      {floatingTexts.map((ft) => (
        <FloatingText key={ft.id} text={ft.text} x={ft.x} y={ft.y} color={ft.color} />
      ))}
    </div>
  )
}
