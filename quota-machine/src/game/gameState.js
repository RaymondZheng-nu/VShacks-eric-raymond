import { rollFailureThreshold } from './turn'

export const MAX_STAMINA = 3
export const STARTING_CREDITS = 50
export const DAYS_PER_WEEK = 6
export const QUOTA_CHECK_DAY = 6
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const RACK_ROWS = 3
export const RACK_COLS = 4

// returns fresh plain-object state for a new run
export function createInitialState() {
  return {
    day: 1,
    week: 1,
    dayOfWeek: 1,
    quotaRequired: 10,
    quotaProgress: 0,
    credits: STARTING_CREDITS,
    stamina: MAX_STAMINA,
    maxStamina: MAX_STAMINA,
    ownedMachines: [],
    connections: [],
    tasks: [],
    shopOffers: [],
    lastDaySummary: null,
    isGameOver: false,
  }
}

let instanceCounter = 0
// returns a unique string id with the given prefix
export function nextInstanceId(prefix) {
  instanceCounter += 1
  return `${prefix}-${instanceCounter}`
}

// marks machine online after puzzle solve
export function bringMachineOnline(state, instanceId, rng = Math.random) {
  return {
    ...state,
    ownedMachines: state.ownedMachines.map((m) =>
      m.instanceId === instanceId
        ? { ...m, online: true, turnsSinceSolved: 0, failureThreshold: rollFailureThreshold(rng) }
        : m
    ),
  }
}

// records a solved connection between two owned machines
export function addConnection(state, instanceIdA, instanceIdB) {
  const connection = {
    instanceId: nextInstanceId('connection'),
    machineInstanceIds: [instanceIdA, instanceIdB],
    solved: true,
  }
  return { ...state, connections: [...state.connections, connection] }
}
