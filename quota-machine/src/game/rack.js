// places machine at a rack slot, fails if occupied
export function placeMachine(state, instanceId, row, col) {
  const occupied = state.ownedMachines.some(
    (m) => m.position?.row === row && m.position?.col === col
  )
  if (occupied) return { ok: false, reason: 'slot occupied', state }
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
export function removeMachineFromRack(state, instanceId) {
  return {
    ...state,
    ownedMachines: state.ownedMachines.map((m) =>
      m.instanceId === instanceId ? { ...m, position: null } : m
    ),
  }
}
