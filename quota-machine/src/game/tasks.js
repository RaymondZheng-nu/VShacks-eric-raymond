import { TASK_TYPES } from '../data/tasks'

// picks 3-5 random tasks, marks automated if machine online
export function generateDailyTasks(state, rng = Math.random) {
  const count = 3 + Math.floor(rng() * 3)

  const shuffled = [...TASK_TYPES]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const picked = shuffled.slice(0, count)

  const onlineMachineIds = (state.ownedMachines ?? [])
    .filter((m) => m.online)
    .map((m) => m.machineId)

  return picked.map((type, index) => ({
    id: `task-${state.day}-${index}`,
    typeId: type.id,
    name: type.name,
    output: type.baseOutput,
    staminaCost: type.staminaCost,
    done: false,
    automated: type.automationMachineId !== null && onlineMachineIds.includes(type.automationMachineId),
  }))
}

// marks a task done and spends 1 stamina
export function resolveTaskManually(state, taskId) {
  const task = (state.tasks ?? []).find((t) => t.id === taskId)
  if (!task) return { ok: false, reason: 'task not found', state }
  if (task.done) return { ok: false, reason: 'task already done', state }
  if (state.stamina <= 0) return { ok: false, reason: 'out of stamina', state }

  return {
    ok: true,
    state: {
      ...state,
      stamina: state.stamina - 1,
      tasks: state.tasks.map((t) => t.id === taskId ? { ...t, done: true } : t),
    },
  }
}
