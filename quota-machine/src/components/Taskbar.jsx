const UI_BASE = `${import.meta.env.BASE_URL}sprites/ui`

// stats and journal icons are best guess mappings swap if wrong
const SLOTS = [
  { key: 'shop', icon: 'icon-shop.png', label: 'Shop' },
  { key: 'machines', icon: 'icon-machines.png', label: 'Machines' },
  { key: 'stats', icon: 'icon-stats.png', label: 'Stats' },
  { key: 'journal', icon: 'icon-journal.png', label: 'Journal' },
  { key: 'settings', icon: 'icon-settings.png', label: 'Settings' },
  { key: 'endturn', icon: 'icon-endturn.png', label: 'End Turn' },
]

// bottom center nav 6 boxes for shop machines stats journal settings end turn
export default function Taskbar({ activePanel, onSelectPanel, onEndTurn, endTurnLabel, endTurnDisabled }) {
  return (
    <div className="taskbar" style={{ backgroundImage: `url(${UI_BASE}/taskbar.png)` }}>
      {SLOTS.map((slot) => {
        const isEndTurn = slot.key === 'endturn'
        return (
          <button
            key={slot.key}
            className={`taskbar-slot${activePanel === slot.key ? ' taskbar-slot--active' : ''}`}
            onClick={isEndTurn ? onEndTurn : () => onSelectPanel(slot.key)}
            disabled={isEndTurn && endTurnDisabled}
          >
            <img src={`${UI_BASE}/${slot.icon}`} alt={slot.label} />
            <span className="taskbar-slot-label">{isEndTurn ? endTurnLabel : slot.label}</span>
          </button>
        )
      })}
    </div>
  )
}
