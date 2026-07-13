import { setInstanceCounter } from './gameState'

const SAVE_KEY = 'quota-machine-save'

export function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state))
  } catch {}
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {}
}

// parses instanceId strings like "conveyor-3" to find the max counter and restores it
export function restoreInstanceCounter(state) {
  let max = 0
  for (const m of state.ownedMachines ?? []) {
    const match = m.instanceId?.match(/-(\d+)$/)
    if (match) {
      const n = parseInt(match[1], 10)
      if (n > max) max = n
    }
  }
  // also check connections
  for (const c of state.connections ?? []) {
    const match = c.instanceId?.match(/-(\d+)$/)
    if (match) {
      const n = parseInt(match[1], 10)
      if (n > max) max = n
    }
  }
  setInstanceCounter(max)
}
