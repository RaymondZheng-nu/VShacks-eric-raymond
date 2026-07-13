export const DEFAULT_SYNERGY_XMULT = 1.1

// computes chips times mult score tasks count as chips at eod
export function resolveScore({ ownedMachines, connections = [], tasks = [], partCatalog, synergyCatalog }) {
  let chips = 0
  let mult = 1
  const contributions = []

  // pre-count online instances per machine type for count-scaling machines
  const onlineCountByType = {}
  for (const owned of ownedMachines) {
    if (!owned.online) continue
    const part = partCatalog.find((p) => p.id === owned.machineId)
    if (!part?.countScaling) continue
    onlineCountByType[owned.machineId] = (onlineCountByType[owned.machineId] ?? 0) + 1
  }

  for (const owned of ownedMachines) {
    if (!owned.online) continue
    const part = partCatalog.find((p) => p.id === owned.machineId)
    if (!part) continue
    const level = owned.level ?? 1 // upgrades scale a machine's own output, not synergy math
    // count-scaling machines multiply output by how many of that type are online
    const count = part.countScaling ? (onlineCountByType[owned.machineId] ?? 1) : 1

    if (part.chips > 0) {
      const chipsValue = part.chips * level * count
      chips += chipsValue
      contributions.push({ source: part.name, instanceId: owned.instanceId, type: 'chips', value: chipsValue })
    }
    if (part.multBonus > 0) {
      const multValue = part.multBonus * level * count
      mult += multValue
      contributions.push({ source: part.name, instanceId: owned.instanceId, type: '+mult', value: multValue })
    }
  }

  for (const task of tasks) {
    if (!task.done && !task.automated) continue
    chips += task.output
    contributions.push({ source: task.name, type: 'chips', value: task.output })
  }

  // chips first then synergy xmult — took a while to get the ordering right
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

    // two find() calls per connection in a loop, but we cap at 6 machines so whatever
    const nameA = partCatalog.find((p) => p.id === ownedA.machineId)?.name ?? ownedA.machineId
    const nameB = partCatalog.find((p) => p.id === ownedB.machineId)?.name ?? ownedB.machineId
    contributions.push({ source: `${nameA} ↔ ${nameB}`, type: 'xmult', value: xmult })
  }

  const total = Math.round(chips * mult)
  // console.log('score', chips, mult, total)
  return { chips, mult, total, contributions }
}
