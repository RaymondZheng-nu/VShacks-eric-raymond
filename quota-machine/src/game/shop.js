import { getMachineById, MACHINES } from '../data/machines'
import { nextInstanceId } from './gameState'

export const INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS'
export const UNKNOWN_MACHINE = 'UNKNOWN_MACHINE'
export const REROLL_COST = 5

// returns scaled cost based on current week
export function scaledCost(machine, week) {
  return Math.ceil(machine.cost * (1 + 0.15 * (week - 1)))
}

// picks 4 random machine ids for the shop this week
export function generateShopOffers(rng = Math.random) {
  // not proper fisher-yates but honestly close enough for 6 items
  const shuffled = [...MACHINES].sort(() => rng() - 0.5)
  const numOffers = 4
  return shuffled.slice(0, numOffers).map((m) => m.id)
}

// re-rolls shop offers if player has enough credits
export function rerollShop(state, rng = Math.random) {
  if (state.credits < REROLL_COST) return { state, error: INSUFFICIENT_CREDITS }
  return {
    state: { ...state, credits: state.credits - REROLL_COST, shopOffers: generateShopOffers(rng) },
    error: null,
  }
}

// deducts scaled cost and adds machine offline to ownedMachines
export function buyMachine(state, machineId) {
  const machine = getMachineById(machineId)
  if (!machine) return { state, error: UNKNOWN_MACHINE }
  const cost = scaledCost(machine, state.week ?? 1)
  if (state.credits < cost) return { state, error: INSUFFICIENT_CREDITS }

  const ownedMachine = {
    instanceId: nextInstanceId(machineId),
    machineId,
    online: false,
    turnsSinceSolved: 0,
    failureThreshold: null,
    position: null,
  }

  return {
    state: {
      ...state,
      credits: state.credits - cost,
      ownedMachines: [...state.ownedMachines, ownedMachine],
    },
    error: null,
  }
}
