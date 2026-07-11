// places machine at a rack slot, fails if occupied
export function placeMachine(state, instanceId, row, col) {
  const occupied = state.ownedMachines.some(
    (m) => m.position?.row === row && m.position?.col === col
  )
  if (occupied) return { ok: false, reason: 'slot occupied', state } // UI should prevent this but just in case
  return {
    ok: true,
    state: {
      ...state,
      ownedMachines: state.ownedMachines.map((m) =>
        m.instanceId === instanceId ? { ...m, position: { row, col } } : m
      ),
    },
  }
}

// moves a placed machine back to inventory
// TODO: rename this, it's way too long
export function removeMachineFromRack(state, instanceId) {
  return {
    ...state,
    ownedMachines: state.ownedMachines.map((m) => {
      if (m.instanceId !== instanceId) return m
      const cleared = { ...m, position: null }
      return cleared
    }),
  }
}
