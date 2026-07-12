import { useEffect, useRef, useState } from 'react'

// shows remaining stamina for this day, flashes briefly whenever it drops
export default function StaminaCounter({ stamina, maxStamina }) {
  const prevStamina = useRef(stamina)
  const [flashing, setFlashing] = useState(false)

  useEffect(() => {
    if (stamina < prevStamina.current) {
      setFlashing(true)
      const timer = setTimeout(() => setFlashing(false), 300)
      prevStamina.current = stamina
      return () => clearTimeout(timer)
    }
    prevStamina.current = stamina
  }, [stamina])

  return (
    <section className={`stamina-counter${flashing ? ' stamina-counter--flash' : ''}${stamina <= 0 ? ' stamina-counter--out' : ''}`}>
      <h2>Stamina</h2>
      <p>{stamina} / {maxStamina}</p>
      {stamina <= 0 && <p className="stamina-counter-empty">Out of stamina — wait for next turn</p>}
    </section>
  )
}
