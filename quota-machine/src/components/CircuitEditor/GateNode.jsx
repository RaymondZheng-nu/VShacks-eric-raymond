const BASE = '/quota-machine/sprites/circuits'

const GATE_SPRITE = {
  AND:    `${BASE}/AND.png`,
  OR:     `${BASE}/OR.png`,
  NOT:    `${BASE}/NOT.png`,
  XOR:    `${BASE}/XOR.png`,
  NAND:   `${BASE}/NAND.png`,
  NOR:    `${BASE}/NOR.png`,
  XNOR:   `${BASE}/XNOR.png`,
  BUFFER: `${BASE}/resistor.png`,
  INPUT:  `${BASE}/switch-closed.png`,
  OUTPUT: `${BASE}/DC.png`,
}

// Renders a single gate or pin as a clickable button with its sprite.
export default function GateNode({ node, selected, onSelect }) {
  const sprite = GATE_SPRITE[node.type]
  return (
    <button
      className={`gate-node gate-node--${node.type.toLowerCase()}${selected ? ' gate-node--selected' : ''}`}
      onClick={onSelect}
      title={node.type}
    >
      {sprite
        ? <img src={sprite} alt={node.type} className="gate-node-sprite" />
        : <span className="gate-node-type">{node.type}</span>
      }
      <span className="gate-node-label">{node.id}</span>
    </button>
  )
}
