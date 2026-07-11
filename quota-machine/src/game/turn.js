import { resolveScore } from '../engine/scoring-engine'
import { MACHINES } from '../data/machines'
import { FEATURED_SYNERGIES } from '../data/synergies'
import { DAYS_PER_WEEK, QUOTA_CHECK_DAY, DAY_NAMES } from './gameState'
import { generateDailyTasks } from './tasks'
import { generateShopOffers } from './shop'

const FAILURE_MIN_TURNS = 4
const FAILURE_MAX_TURNS = 6 // maybe increase this later, feels punishing
const CREDITS_PER_QUOTA_PASS = 20

// returns random turns before a machine can fail
export function rollFailureThreshold(rng = Math.random) {
  const span = FAILURE_MAX_TURNS - FAILURE_MIN_TURNS + 1
  return FAILURE_MIN_TURNS + Math.floor(rng() * span)
}

// advances one day: ticks machines, scores, checks quota
export function advanceTurn(state, rng = Math.random) {
  const isQuotaDay = state.dayOfWeek === QUOTA_CHECK_DAY

  const ownedMachines = state.ownedMachines.map((m) => ({ ...m }))

  for (const m of ownedMachines) {
    if (!m.online) continue
    m.turnsSinceSolved += 1
    if (m.failureThreshold != null && m.turnsSinceSolved >= m.failureThreshold) {
      m.online = false
    }
  }

  const score = resolveScore({
    ownedMachines,
    connections: state.connections,
    tasks: state.tasks,
    partCatalog: MACHINES,
    synergyCatalog: FEATURED_SYNERGIES,
  })

  const dailyCredits = ownedMachines.filter((m) => m.online).length

  let quotaProgress = state.quotaProgress + score.total
  let { quotaRequired, credits, week, isGameOver } = state
  credits += dailyCredits
  let dayOfWeek = state.dayOfWeek
  let quotaPassed = null
  let creditsEarned = 0
  let shopOffers = state.shopOffers

  if (isQuotaDay) {
    quotaPassed = quotaProgress >= quotaRequired
    if (quotaPassed) {
      creditsEarned = CREDITS_PER_QUOTA_PASS
      credits += CREDITS_PER_QUOTA_PASS
      quotaProgress = Math.max(0, quotaProgress - quotaRequired)
      quotaRequired = Math.ceil(quotaRequired * 1.15) // 15% ramp per week, TODO: tune this
      week += 1
      dayOfWeek = 1
      shopOffers = generateShopOffers(rng)
    } else {
      isGameOver = true
      dayOfWeek += 1
    }
  } else {
    dayOfWeek += 1
  }

  const day = state.day + 1

  const lastDaySummary = {
    day: state.day,
    week: state.week,
    dayName: DAY_NAMES[state.dayOfWeek - 1],
    contributions: score.contributions,
    chips: score.chips,
    mult: score.mult,
    scoreTotal: score.total,
    dailyCredits,
    isQuotaDay,
    quotaPassed: isQuotaDay ? quotaPassed : null,
    creditsEarned,
  }

  const nextState = {
    ...state,
    day,
    week,
    dayOfWeek,
    quotaRequired,
    quotaProgress,
    credits,
    ownedMachines,
    isGameOver,
    lastDaySummary,
    shopOffers,
    stamina: state.maxStamina,
  }

  const tasks = isGameOver ? [] : generateDailyTasks(nextState, rng)
  return { ...nextState, tasks }
}

// spends 1 stamina; returns ok false if already zero
export function spendStamina(state) {
  if (state.stamina <= 0) return { ok: false, reason: 'out of stamina', state }
  return { ok: true, state: { ...state, stamina: state.stamina - 1 } }
}
