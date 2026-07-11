// Pure shop logic: no React, no DOM.

import { getMachineById } from '../data/machines'
import { nextInstanceId } from './gameState'

export const INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS'
export const UNKNOWN_MACHINE = 'UNKNOWN_MACHINE'

/**
 * Buys a machine: deducts its cost from credits and adds it to the owned
 * list, offline, awaiting its puzzle being solved. Returns
 * { state, error } — state is unchanged and error is set if the purchase
 * is invalid, so the UI can show why.
 */
export function buyMachine(state, machineId) {
  const machine = getMachineById(machineId)
  if (!machine) {
    return { state, error: UNKNOWN_MACHINE }
  }
  if (state.credits < machine.cost) {
    return { state, error: INSUFFICIENT_CREDITS }
  }

  const ownedMachine = {
    instanceId: nextInstanceId(machineId),
    machineId,
    online: false,
    turnsSinceSolved: 0,
    failureThreshold: null,
  }

  return {
    state: {
      ...state,
      credits: state.credits - machine.cost,
      ownedMachines: [...state.ownedMachines, ownedMachine],
    },
    error: null,
  }
}
