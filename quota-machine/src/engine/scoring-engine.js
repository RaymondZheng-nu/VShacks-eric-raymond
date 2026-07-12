export const DEFAULT_SYNERGY_XMULT = 1.1

// computes chips times mult score tasks count as chips at eod
export function resolveScore({ ownedMachines, connections = [], tasks = [], partCatalog, synergyCatalog }) {
  let chips = 0
  let mult = 1
  const contributions = []

  for (const owned of ownedMachines) {
    if (!owned.online) continue
    const part = partCatalog.find((p) => p.id === owned.machineId)
    if (!part) continue

    if (part.chips > 0) {
      chips += part.chips
      contributions.push({ source: part.name, instanceId: owned.instanceId, type: 'chips', value: part.chips })
    }
    if (part.multBonus > 0) {
      mult += part.multBonus
      contributions.push({ source: part.name, instanceId: owned.instanceId, type: '+mult', value: part.multBonus })
    }
  }

  for (const task of tasks) {
    if (!task.done && !task.automated) continue
    chips += task.output
    contributions.push({ source: task.name, type: 'chips', value: task.output })
  }

  for (const conn of connections) {
    if (!conn.solved) continue
    const [idA, idB] = conn.machineInstanceIds
    const ownedA = ownedMachines.find((m) => m.instanceId === idA)
    const ownedB = ownedMachines.find((m) => m.instanceId === idB)
    if (!ownedA?.online || !ownedB?.online) continue

    const keyOf = (a, b) => [a, b].sort().join('::')
    const synergy = synergyCatalog.find(
      (s) => keyOf(s.machineIds[0], s.machineIds[1]) === keyOf(ownedA.machineId, ownedB.machineId)
    )
    const xmult = synergy?.multiplier ?? DEFAULT_SYNERGY_XMULT
    mult *= xmult

    // todo cache part lookups
    const nameA = partCatalog.find((p) => p.id === ownedA.machineId)?.name ?? ownedA.machineId
    const nameB = partCatalog.find((p) => p.id === ownedB.machineId)?.name ?? ownedB.machineId
    contributions.push({ source: `${nameA} ↔ ${nameB}`, type: 'xmult', value: xmult })
  }

  const total = Math.round(chips * mult)
  // console.log('score', chips, mult, total)
  return { chips, mult, total, contributions }
}
