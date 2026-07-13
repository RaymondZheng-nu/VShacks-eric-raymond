import { rollFailureThreshold } from './turn'

export const MAX_STAMINA = 4
export const STARTING_CREDITS = 40
export const DAYS_PER_WEEK = 1
export const QUOTA_CHECK_DAY = 1
export const DEBT_CUTOFF = 50
export const DAY_NAMES = ['Day']

// returns fresh state for a new run
export function createInitialState() {
  return {
    day: 1,
    week: 1,
    dayOfWeek: 1,
    quotaRequired: 2,
    quotaProgress: 0,
    credits: STARTING_CREDITS,
    debt: 0,
    totalTasksCompleted: 0,
    stamina: MAX_STAMINA,
    maxStamina: MAX_STAMINA,
    ownedMachines: [],
    connections: [],
    tasks: [],
    shopOffers: [],
    lastDaySummary: null,
    isGameOver: false,
    currentEvent: null,
    shopDiscount: false,
  }
}

let instanceCounter = 0 // global, TODO: shove into state someday
export function nextInstanceId(prefix) {
  instanceCounter += 1
  return `${prefix}-${instanceCounter}`
}
// called on load to avoid id collisions with stuff already in the save
export function setInstanceCounter(n) {
  instanceCounter = n
}

// marks machine online after solve
export function bringMachineOnline(state, instanceId, rand = Math.random) { // rand not rng, typo that stuck
  return {
    ...state,
    ownedMachines: state.ownedMachines.map((m) =>
      m.instanceId === instanceId
        ? { ...m, online: true, turnsSinceSolved: 0, failureThreshold: rollFailureThreshold(rand) }
        : m
    ),
  }
}

// records solved connection between two machines
export function addConnection(state, instanceIdA, instanceIdB) {
  const connection = {
    instanceId: nextInstanceId('connection'),
    machineInstanceIds: [instanceIdA, instanceIdB],
    solved: true, // solved true is hardcoded no unsolved connections yet
  }
  return { ...state, connections: [...state.connections, connection] }
}
