import { useEffect, useState } from 'react'

const UI_BASE = `${import.meta.env.BASE_URL}sprites/ui`
const COUNT_DURATION_MS = 500

// pinned top right glow flips color on credits sign
export default function RevenueBar({ credits }) {
  // shown number, ticks toward the real credits instead of snapping
  const [displayedCredits, setDisplayedCredits] = useState(credits)

  useEffect(() => {
    if (displayedCredits === credits) return

    const startValue = displayedCredits
    const endValue = credits
    const startTime = performance.now()
    let frameId

    function step(now) {
      const progress = Math.min((now - startTime) / COUNT_DURATION_MS, 1)
      setDisplayedCredits(Math.round(startValue + (endValue - startValue) * progress))
      if (progress < 1) frameId = requestAnimationFrame(step)
    }

    frameId = requestAnimationFrame(step)
    // only credits in deps on purpose, displayedCredits changes every frame from this same effect
    // if a new credits value comes in mid count this just cancels and restarts from wherever we are
    return () => cancelAnimationFrame(frameId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credits])

  // color always follows the real value, not the mid count number, so it doesnt flicker
  const glow = credits >= 0 ? 'revenue-glow-green.png' : 'revenue-glow-red.png'

  return (
    <div className="revenue-bar">
      <img className="revenue-bar-base" src={`${UI_BASE}/revenue-bar.png`} alt="" />
      <img className="revenue-bar-glow" src={`${UI_BASE}/${glow}`} alt="" />
      <span className="revenue-bar-value">{displayedCredits}</span>
    </div>
  )
}
