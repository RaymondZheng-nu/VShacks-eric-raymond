const SPRITE_BASE = '/quota-machine/sprites/player'

// returns sprite path based on quota completion
function getSpriteForQuota(quotaProgress, quotaRequired) {
  const pct = quotaRequired > 0 ? quotaProgress / quotaRequired : 0
  if (pct >= 0.66) return `${SPRITE_BASE}/player_happy.png`
  if (pct >= 0.33) return `${SPRITE_BASE}/player_neutral.png`
  return `${SPRITE_BASE}/player_sad.png`
}

// fixed bottom left player sprite reacts to quota progress
export default function PlayerSprite({ quotaProgress, quotaRequired }) {
  const src = getSpriteForQuota(quotaProgress, quotaRequired)
  return <img className="player-sprite" src={src} alt="player" />
}
