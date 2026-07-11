export function spendStamina(state) {
  if (state.stamina <= 0) {
    return { ok: false, reason: 'out of stamina', state };
  }
  return { ok: true, state: { ...state, stamina: state.stamina - 1 } };
}