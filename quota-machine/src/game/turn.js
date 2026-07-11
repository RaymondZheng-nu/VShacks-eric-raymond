// Pure turn-resolution logic: no React, no DOM, fully testable in
// isolation from the gameState helpers that call into it.

import { getMachineById } from '../data/machines'
import { findSynergy, DEFAULT_SYNERGY_BONUS } from '../data/synergies'

const FAILURE_MIN_TURNS = 4
const FAILURE_MAX_TURNS = 6
const QUOTA_GROWTH_RATE = 1.15

export function rollFailureThreshold(rng = Math.random) {
  const span = FAILURE_MAX_TURNS - FAILURE_MIN_TURNS + 1
  return FAILURE_MIN_TURNS + Math.floor(rng() * span)
}

function computeMachineOutput(ownedMachine, allOwnedMachines, connections) {
  const machine = getMachineById(ownedMachine.machineId)
  if (!machine) return 0

  let output = machine.baseOutput

  const relevantConnections = connections.filter(
    (c) => c.solved && c.machineInstanceIds.includes(ownedMachine.instanceId)
  )

  for (const conn of relevantConnections) {
    const otherInstanceId = conn.machineInstanceIds.find(
      (id) => id !== ownedMachine.instanceId
    )
    const other = allOwnedMachines.find((m) => m.instanceId === otherInstanceId)
    if (!other || !other.online) continue

    const synergy = findSynergy(ownedMachine.machineId, other.machineId)
    const bonus = synergy ? synergy.multiplier : DEFAULT_SYNERGY_BONUS
    output *= bonus
  }

  return output
}

/**
 * Advances the game by one turn: ticks output for every online machine,
 * rolls the ~5-turn random failure check, and settles quota vs. debt.
 * Returns a new state object; does not mutate `state`.
 */
export function advanceTurn(state, rng = Math.random) {
  const ownedMachines = state.ownedMachines.map((m) => ({ ...m }))

  let quotaProgress = state.quotaProgress

  for (const m of ownedMachines) {
    if (!m.online) continue

    quotaProgress += computeMachineOutput(m, ownedMachines, state.connections)

    m.turnsSinceSolved += 1
    if (m.failureThreshold != null && m.turnsSinceSolved >= m.failureThreshold) {
      m.online = false
    }
  }

  let { debt, quotaRequired } = state

  if (quotaProgress >= quotaRequired) {
    quotaProgress -= quotaRequired
    quotaRequired = Math.ceil(quotaRequired * QUOTA_GROWTH_RATE)
  } else {
    debt += quotaRequired - quotaProgress
    quotaProgress = 0
  }

  const isGameOver = debt >= state.debtCutoff

  return {
    ...state,
    turn: state.turn + 1,
    quotaProgress,
    quotaRequired,
    debt,
    ownedMachines,
    isGameOver,
    stamina: state.maxStamina,
  }
}

/**
 * Spends 1 stamina for a circuit-solving action (powering a machine or
 * connecting two machines). Buying/upgrading machines is money-only and
 * never goes through this. Returns { ok: false } without touching state
 * if stamina is already 0 — the caller must block the action and wait
 * for the next turn's reset.
 */
export function spendStamina(state) {
  if (state.stamina <= 0) {
    return { ok: false, reason: 'out of stamina', state }
  }
  return { ok: true, state: { ...state, stamina: state.stamina - 1 } }
}
