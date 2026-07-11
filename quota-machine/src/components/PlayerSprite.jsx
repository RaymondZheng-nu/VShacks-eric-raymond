const SPRITE_BASE = '/quota-machine/sprites/player'

// Returns the sprite path matching the player's current quota completion percentage.
function getSpriteForQuota(quotaProgress, quotaRequired) {
  const pct = quotaRequired > 0 ? quotaProgress / quotaRequired : 0
  if (pct >= 0.66) return `${SPRITE_BASE}/player_happy.png`
  if (pct >= 0.33) return `${SPRITE_BASE}/player_neutral.png`
  return `${SPRITE_BASE}/player_sad.png`
}

// Fixed bottom-left player sprite that reacts to weekly quota progress.
export default function PlayerSprite({ quotaProgress, quotaRequired }) {
  const src = getSpriteForQuota(quotaProgress, quotaRequired)
  return <img className="player-sprite" src={src} alt="player" />
}
