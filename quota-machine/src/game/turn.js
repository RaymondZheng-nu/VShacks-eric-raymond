import { resolveScore } from '../engine/scoring-engine'
import { MACHINES } from '../data/machines'
import { FEATURED_SYNERGIES } from '../data/synergies'
import { DAYS_PER_WEEK, QUOTA_CHECK_DAY, DAY_NAMES, DEBT_CUTOFF } from './gameState'
import { generateDailyTasks } from './tasks'
import { generateShopOffers } from './shop'

const DAILY_EVENTS = [
  { id: 'power-surge',  name: 'Power Surge',      desc: 'All machines aged 2 extra turns.' },
  { id: 'overtime',     name: 'Overtime',          desc: '+2 stamina today.' },
  { id: 'bulk-deal',    name: 'Bulk Deal',         desc: 'Shop costs halved today.' },
  { id: 'efficiency',   name: 'Efficiency Drive',  desc: 'Tasks give double output today.' },
]
const EVENT_CHANCE = 0.3

const FAILURE_MIN_TURNS = 4
const FAILURE_MAX_TURNS = 6 // maybe increase this later, feels punishing
const CREDITS_PER_QUOTA_PASS = 35

// returns random turns before a machine can fail
export function rollFailureThreshold(rng = Math.random) {
  const span = FAILURE_MAX_TURNS - FAILURE_MIN_TURNS + 1
  return FAILURE_MIN_TURNS + Math.floor(rng() * span)
}

// does everything for end of turn probably too much
export function advanceTurn(state, rng = Math.random) {
  const isQuotaDay = state.dayOfWeek === QUOTA_CHECK_DAY // saturday

  const currentEvent = rng() < EVENT_CHANCE ? DAILY_EVENTS[Math.floor(rng() * DAILY_EVENTS.length)] : null

  const ownedMachines = state.ownedMachines.map((m) => ({ ...m }))

  const surgeDmg = currentEvent?.id === 'power-surge' ? 2 : 0
  for (const m of ownedMachines) {
    if (!m.online) continue
    m.turnsSinceSolved += 1 + surgeDmg
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

  const dailyCredits = ownedMachines.filter((m) => m.online).length * 3 // 3 credits per online machine per day

  let quotaProgress = state.quotaProgress + score.total
  let { quotaRequired, credits, week, isGameOver, debt } = state
  credits += dailyCredits
  let dayOfWeek = state.dayOfWeek
  let quotaPassed = null
  let creditsEarned = 0
  let debtIncurred = 0
  let shopOffers = state.shopOffers

  if (isQuotaDay) {
    quotaPassed = quotaProgress >= quotaRequired
    if (quotaPassed) {
      creditsEarned = CREDITS_PER_QUOTA_PASS
      credits += CREDITS_PER_QUOTA_PASS
      quotaProgress = Math.max(0, quotaProgress - quotaRequired)
      quotaRequired = Math.ceil(quotaRequired * 1.15) // 15% ramp per day
      week += 1
      dayOfWeek = 1
      shopOffers = generateShopOffers(rng)
    } else {
      // shortfall becomes debt and is deducted from credits so the revenue bar goes red
      debtIncurred = quotaRequired - quotaProgress
      debt += debtIncurred
      credits -= debtIncurred
      quotaProgress = Math.max(0, quotaProgress - quotaRequired)
      quotaRequired = Math.ceil(quotaRequired * 1.15) // 15% ramp per day
      week += 1
      dayOfWeek = 1
      shopOffers = generateShopOffers(rng)
      isGameOver = debt > DEBT_CUTOFF // used to be instant game over on quota fail, debt system came later
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
    debtIncurred,
    currentEvent,
  }

  const nextState = {
    ...state,
    day,
    week,
    dayOfWeek,
    quotaRequired,
    quotaProgress,
    credits,
    debt,
    ownedMachines,
    isGameOver,
    lastDaySummary,
    shopOffers,
    stamina: state.maxStamina + (currentEvent?.id === 'overtime' ? 2 : 0),
    currentEvent,
    shopDiscount: currentEvent?.id === 'bulk-deal',
  }

  const tasks = isGameOver ? [] : generateDailyTasks(nextState, rng, currentEvent)
  // console.log('day done, tasks:', tasks.length)
  return { ...nextState, tasks }
}

// spends stamina returns ok false if already zero
export function spendStamina(state) {
  if (state.stamina <= 0) return { ok: false, reason: 'out of stamina', state }
  return { ok: true, state: { ...state, stamina: state.stamina - 1 } }
}
