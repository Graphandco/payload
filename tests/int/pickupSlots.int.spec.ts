import { describe, expect, it } from 'vitest'
import type { Site } from '@/payload-types'
import { getAvailablePickupSlots } from '@/lib/pickupSlots'

function makeSite(overrides: Partial<Site> = {}): Site {
  return {
    id: 1,
    name: 'Test',
    slug: 'test',
    updatedAt: '',
    createdAt: '',
    schedule: {
      weeklyHours: {
        monday: { closed: false, slots: [{ open: '11:00', close: '14:00' }] },
        tuesday: { closed: true, slots: [] },
        wednesday: { closed: true, slots: [] },
        thursday: { closed: true, slots: [] },
        friday: { closed: true, slots: [] },
        saturday: { closed: true, slots: [] },
        sunday: { closed: true, slots: [] },
      },
    },
    clickAndCollect: {
      enabledBySchedule: true,
      manualStatus: 'auto',
      minLeadTimeMinutes: 0,
      slotDurationMinutes: '30',
    },
    ...overrides,
  } as Site
}

describe('getAvailablePickupSlots', () => {
  it('returns slots within opening hours', () => {
    const site = makeSite()
    const monday = new Date('2026-06-01T10:00:00+02:00')

    const slots = getAvailablePickupSlots(site, monday)

    expect(slots.length).toBeGreaterThan(0)
    expect(slots[0].time).toBe('11:00')
    expect(slots.at(-1)?.time).toBe('13:30')
  })

  it('respects minimum lead time on the current day', () => {
    const site = makeSite({
      clickAndCollect: {
        enabledBySchedule: true,
        manualStatus: 'auto',
        minLeadTimeMinutes: 60,
        slotDurationMinutes: '30',
      },
    })
    const mondayLateMorning = new Date('2026-06-01T11:45:00+02:00')

    const slots = getAvailablePickupSlots(site, mondayLateMorning)

    expect(slots.every((slot) => slot.time >= '12:30')).toBe(true)
  })
})
