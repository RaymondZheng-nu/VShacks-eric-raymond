import { describe, it, expect } from 'vitest'
import { resolveScore, DEFAULT_SYNERGY_XMULT } from './scoring-engine'

const fakeParts = [
  { id: 'chip-a', name: 'Chip A', chips: 3, multBonus: 0 },
  { id: 'mult-b', name: 'Mult B', chips: 0, multBonus: 2 },
  { id: 'dual-c', name: 'Dual C', chips: 2, multBonus: 1 },
]

const fakeSynergies = [
  { machineIds: ['chip-a', 'mult-b'], multiplier: 2 },
]

describe('resolveScore', () => {
  it('returns zero when no machines are online', () => {
    const result = resolveScore({
      ownedMachines: [],
      tasks: [],
      partCatalog: fakeParts,
      synergyCatalog: fakeSynergies,
    })
    expect(result.total).toBe(0)
  })

  it('a single chip machine contributes chips × 1 mult', () => {
    const result = resolveScore({
      ownedMachines: [{ instanceId: 'i1', machineId: 'chip-a', online: true }],
      tasks: [],
      partCatalog: fakeParts,
      synergyCatalog: fakeSynergies,
    })
    expect(result.chips).toBe(3)
    expect(result.mult).toBe(1)
    expect(result.total).toBe(3)
  })

  it('a mult machine adds to mult but not chips', () => {
    const result = resolveScore({
      ownedMachines: [{ instanceId: 'i2', machineId: 'mult-b', online: true }],
      tasks: [],
      partCatalog: fakeParts,
      synergyCatalog: fakeSynergies,
    })
    expect(result.chips).toBe(0)
    expect(result.mult).toBe(3)
    expect(result.total).toBe(0)
  })

  it('chip + mult machines combine correctly', () => {
    const result = resolveScore({
      ownedMachines: [
        { instanceId: 'i1', machineId: 'chip-a', online: true },
        { instanceId: 'i2', machineId: 'mult-b', online: true },
      ],
      tasks: [],
      partCatalog: fakeParts,
      synergyCatalog: fakeSynergies,
    })
    expect(result.chips).toBe(3)
    expect(result.mult).toBe(3)
    expect(result.total).toBe(9)
  })

  it('a solved synergy connection applies ×mult', () => {
    const result = resolveScore({
      ownedMachines: [
        { instanceId: 'i1', machineId: 'chip-a', online: true },
        { instanceId: 'i2', machineId: 'mult-b', online: true },
      ],
      connections: [
        { solved: true, machineInstanceIds: ['i1', 'i2'] },
      ],
      tasks: [],
      partCatalog: fakeParts,
      synergyCatalog: fakeSynergies,
    })
    expect(result.total).toBe(Math.round(3 * 3 * 2))
  })

  it('completed tasks contribute chips', () => {
    const result = resolveScore({
      ownedMachines: [],
      tasks: [{ done: true, automated: false, output: 5, name: 'T' }],
      partCatalog: fakeParts,
      synergyCatalog: fakeSynergies,
    })
    expect(result.chips).toBe(5)
    expect(result.total).toBe(5)
  })

  it('automated tasks and offline machines', () => {
    const result = resolveScore({
      ownedMachines: [{ instanceId: 'i1', machineId: 'chip-a', online: false }],
      tasks: [{ done: false, automated: true, output: 4, name: 'Auto' }],
      partCatalog: fakeParts,
      synergyCatalog: fakeSynergies,
    })
    expect(result.chips).toBe(4)
    expect(result.mult).toBe(1)
    expect(result.total).toBe(4)
  })
})
