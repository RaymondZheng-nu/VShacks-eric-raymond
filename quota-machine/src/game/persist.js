import { setInstanceCounter } from './gameState'

const SAVE_KEY = 'quota-machine-save'
// TODO: should probably version this at some point so old saves don't silently break

export function saveGame(state) {
  // console.log('saving', state.day)
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
    // corrupt save, just wipe it
    localStorage.removeItem(SAVE_KEY)
    return null
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY)
}

// instanceIds look like "conveyor-3", parse the trailing number to restore the global counter
// otherwise buying a machine after loading will generate a duplicate id
export function restoreInstanceCounter(state) {
  let max = 0
  const ids = [
    ...(state.ownedMachines ?? []).map(m => m.instanceId),
    ...(state.connections ?? []).map(c => c.instanceId),
  ]
  for (const id of ids) {
    const n = parseInt(id?.split('-').pop(), 10)
    if (!isNaN(n) && n > max) max = n
  }
  setInstanceCounter(max)
}
