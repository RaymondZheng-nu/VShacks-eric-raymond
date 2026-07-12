const UI_BASE = `${import.meta.env.BASE_URL}sprites/ui`

// pinned top right glow flips color on credits sign
export default function RevenueBar({ credits }) {
  const glow = credits >= 0 ? 'revenue-glow-green.png' : 'revenue-glow-red.png'

  return (
    <div className="revenue-bar">
      <img className="revenue-bar-base" src={`${UI_BASE}/revenue-bar.png`} alt="" />
      <img className="revenue-bar-glow" src={`${UI_BASE}/${glow}`} alt="" />
      <span className="revenue-bar-value">{credits}</span>
    </div>
  )
}
