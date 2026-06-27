import { describe, expect, it } from 'vitest'
import type { Site } from '@/payload-types'
import { getSiteStatusBanner, isRestaurantOpen } from '@/lib/clickAndCollectStatus'
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
      sameDayOnly: true,
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
    expect(slots[0].time).toBe('11:30')
    expect(slots.at(-1)?.time).toBe('13:30')
  })

  it('skips the opening time as first pickup slot', () => {
    const site = makeSite({
      schedule: {
        weeklyHours: {
          monday: { closed: false, slots: [{ open: '11:30', close: '14:00' }] },
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
        sameDayOnly: true,
      },
    })
    const mondayMorning = new Date('2026-06-01T10:00:00+02:00')

    const slots = getAvailablePickupSlots(site, mondayMorning)

    expect(slots[0]?.time).toBe('12:00')
    expect(slots.some((slot) => slot.time === '11:30')).toBe(false)
  })

  it('skips opening time with 15-minute slots', () => {
    const site = makeSite({
      schedule: {
        weeklyHours: {
          monday: { closed: false, slots: [{ open: '11:30', close: '14:00' }] },
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
        slotDurationMinutes: '15',
        sameDayOnly: true,
      },
    })
    const atOpening = new Date('2026-06-01T11:30:00+02:00')

    const slots = getAvailablePickupSlots(site, atOpening)

    expect(slots[0]?.time).toBe('11:45')
    expect(slots.some((slot) => slot.time === '11:30')).toBe(false)
  })

  it('respects minimum lead time on the current day', () => {
    const site = makeSite({
      clickAndCollect: {
        enabledBySchedule: true,
        manualStatus: 'auto',
        minLeadTimeMinutes: 60,
        slotDurationMinutes: '30',
        sameDayOnly: true,
      },
    })
    const mondayLateMorning = new Date('2026-06-01T11:45:00+02:00')

    const slots = getAvailablePickupSlots(site, mondayLateMorning)

    expect(slots.every((slot) => slot.time >= '12:30')).toBe(true)
  })

  it('caps last pickup slot with lastPickupSlotTime', () => {
    const site = makeSite({
      schedule: {
        weeklyHours: {
          monday: { closed: false, slots: [{ open: '19:00', close: '22:00' }] },
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
        minLeadTimeMinutes: 15,
        slotDurationMinutes: '15',
        lastPickupSlotTime: '21:30',
        sameDayOnly: true,
      },
    })
    const mondayEvening = new Date('2026-06-01T19:00:00+02:00')

    const slots = getAvailablePickupSlots(site, mondayEvening)

    expect(slots.at(-1)?.time).toBe('21:30')
    expect(slots.some((slot) => slot.time === '21:45')).toBe(false)
  })

  it('does not return next-day slots when sameDayOnly is true', () => {
    const site = makeSite({
      schedule: {
        weeklyHours: {
          monday: { closed: false, slots: [{ open: '11:00', close: '14:00' }] },
          tuesday: { closed: false, slots: [{ open: '11:00', close: '14:00' }] },
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
        sameDayOnly: true,
      },
    })
    const mondayAfterClosing = new Date('2026-06-01T14:00:00+02:00')

    const slots = getAvailablePickupSlots(site, mondayAfterClosing)

    expect(slots).toHaveLength(0)
  })
})

describe('getSiteStatusBanner', () => {
  it('shows restaurant open and click and collect availability separately', () => {
    const site = makeSite({
      schedule: {
        weeklyHours: {
          monday: { closed: false, slots: [{ open: '19:00', close: '22:00' }] },
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
        minLeadTimeMinutes: 15,
        slotDurationMinutes: '15',
        lastPickupSlotTime: '21:30',
        sameDayOnly: true,
      },
    })
    const mondayEvening = new Date('2026-06-01T20:00:00+02:00')

    expect(isRestaurantOpen(site, mondayEvening)).toBe(true)

    const banner = getSiteStatusBanner(site, mondayEvening)

    expect(banner.restaurantOpen).toBe(true)
    expect(banner.restaurantMessage).toBe('Restaurant ouvert')
    expect(banner.clickAndCollectAvailable).toBe(true)
    expect(banner.clickAndCollectMessage).toContain("jusqu'à 21h30")
  })
})
