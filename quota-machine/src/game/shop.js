import { getMachineById, MACHINES } from '../data/machines'
import { nextInstanceId } from './gameState'

export const INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS'
export const UNKNOWN_MACHINE = 'UNKNOWN_MACHINE'
export const REROLL_COST = 5
export const MAX_MACHINE_LEVEL = 3

// returns scaled cost based on week
export function scaledCost(machine, week, discount = false) {
  const base = Math.ceil(machine.cost * (1 + 0.15 * (week - 1)))
  return discount ? Math.ceil(base * 0.5) : base
}

// picks 4 random machine ids for the shop
export function generateShopOffers(rng = Math.random) {
  // not proper fisher yates but close enough for 6 items
  const shuffled = [...MACHINES].sort(() => rng() - 0.5)
  const offerCount = 4 // TODO make this a top-level const
  return shuffled.slice(0, offerCount).map((m) => m.id)
}

// rerolls shop offers if player has enough credits
export function rerollShop(state, rng = Math.random) {
  if (state.credits < REROLL_COST) return { state, error: INSUFFICIENT_CREDITS }
  return {
    state: { ...state, credits: state.credits - REROLL_COST, shopOffers: generateShopOffers(rng) },
    error: null,
  }
}

// deducts scaled cost and adds machine offline
export function buyMachine(state, machineId) {
  const machine = getMachineById(machineId)
  if (!machine) return { state, error: UNKNOWN_MACHINE }
  const cost = scaledCost(machine, state.week ?? 1, state.shopDiscount ?? false)
  if (state.credits < cost) return { state, error: INSUFFICIENT_CREDITS }

  const newMach = {
    instanceId: nextInstanceId(machineId),
    machineId,
    online: false,
    turnsSinceSolved: 0,
    failureThreshold: null,
    level: 1,
  }

  // todo should we prevent buying duplicates
  return {
    state: {
      ...state,
      credits: state.credits - cost,
      ownedMachines: [...state.ownedMachines, newMach],
    },
    error: null,
  }
}

// 1.5x base cost per level — felt right after playtesting, don't tweak without re-testing balance
export function upgradeCost(machine, currentLevel) {
  return Math.ceil(machine.cost * 1.5 * currentLevel)
}

// levels up an owned machine; returns state unchanged if maxed or too expensive
export function upgradeMachine(state, instanceId) {
  const owned = state.ownedMachines.find((m) => m.instanceId === instanceId)
  if (!owned) return state
  const machine = getMachineById(owned.machineId)
  if (!machine) return state

  const level = owned.level ?? 1
  if (level >= MAX_MACHINE_LEVEL) return state // silently no-ops; button should be greyed out anyway

  const cost = upgradeCost(machine, level)
  if (state.credits < cost) return state

  return {
    ...state,
    credits: state.credits - cost,
    ownedMachines: state.ownedMachines.map((m) =>
      m.instanceId === instanceId ? { ...m, level: level + 1 } : m
    ),
  }
}
