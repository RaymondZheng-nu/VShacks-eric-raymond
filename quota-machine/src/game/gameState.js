// Plain-object game state shape + small pure helpers for creating/mutating
// it. No React here — components should only ever call into game/ and
// engine/, never encode rules themselves.

import { rollFailureThreshold } from './turn'

export const STARTING_DEBT_CUTOFF = 100
export const MAX_STAMINA = 3

/**
 * ownedMachine shape:
 *   {
 *     instanceId: string,       // unique per purchase, since you can own dupes
 *     machineId: string,        // ref into data/machines.js
 *     online: boolean,
 *     turnsSinceSolved: number, // turns since last solved/repaired
 *     failureThreshold: number | null, // turns online before it can fail; null until first solved
 *   }
 *
 * connection shape:
 *   {
 *     instanceId: string,
 *     machineInstanceIds: [string, string],
 *     solved: boolean,
 *   }
 */
export function createInitialState() {
  return {
    turn: 1,
    quotaRequired: 10,
    quotaProgress: 0,
    debt: 0,
    debtCutoff: STARTING_DEBT_CUTOFF,
    credits: 50,
    stamina: MAX_STAMINA,
    maxStamina: MAX_STAMINA,
    ownedMachines: [],
    connections: [],
    isGameOver: false,
  }
}

let instanceCounter = 0
export function nextInstanceId(prefix) {
  instanceCounter += 1
  return `${prefix}-${instanceCounter}`
}

/**
 * Marks an owned machine online after its puzzle has been solved
 * (initial solve, or re-solve after a failure), rolling a fresh
 * randomized failure threshold.
 */
export function bringMachineOnline(state, instanceId, rng = Math.random) {
  return {
    ...state,
    ownedMachines: state.ownedMachines.map((m) =>
      m.instanceId === instanceId
        ? {
            ...m,
            online: true,
            turnsSinceSolved: 0,
            failureThreshold: rollFailureThreshold(rng),
          }
        : m
    ),
  }
}

/**
 * Records a solved connection puzzle between two owned machines, enabling
 * the synergy bonus between them on future turns.
 */
export function addConnection(state, instanceIdA, instanceIdB) {
  const connection = {
    instanceId: nextInstanceId('connection'),
    machineInstanceIds: [instanceIdA, instanceIdB],
    solved: true,
  }
  return {
    ...state,
    connections: [...state.connections, connection],
  }
}
