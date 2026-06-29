import { describe, expect, it } from 'vitest'
import type { Site } from '@/payload-types'
import { getSiteStatusBanner, isRestaurantOpen } from '@/lib/clickAndCollectStatus'
import { getAvailablePickupSlots } from '@/lib/pickupSlots'
import type { ServicePeriod } from '@/lib/siteSchedule'

function closedDay(): ServicePeriod {
  return { closed: true }
}

function lunchPeriod(
  first: string,
  last: string,
  restaurantOpen = first,
  restaurantClose = '14:00',
): ServicePeriod {
  return {
    closed: false,
    restaurantOpen,
    firstPickupSlot: first,
    restaurantClose,
    lastPickupSlot: last,
  }
}

function makeSite(overrides: Partial<Site> = {}): Site {
  return {
    id: 1,
    name: 'Test',
    slug: 'test',
    updatedAt: '',
    createdAt: '',
    schedule: {
      weeklyHours: {
        mondayLunch: lunchPeriod('11:00', '13:30', '11:00', '14:00'),
        mondayEvening: closedDay(),
        tuesdayLunch: closedDay(),
        tuesdayEvening: closedDay(),
        wednesdayLunch: closedDay(),
        wednesdayEvening: closedDay(),
        thursdayLunch: closedDay(),
        thursdayEvening: closedDay(),
        fridayLunch: closedDay(),
        fridayEvening: closedDay(),
        saturdayLunch: closedDay(),
        saturdayEvening: closedDay(),
        sundayLunch: closedDay(),
        sundayEvening: closedDay(),
      },
    },
    clickAndCollect: {
      manualStatus: 'auto',
      slotDurationMinutes: '30',
    },
    ...overrides,
  } as Site
}

describe('getAvailablePickupSlots', () => {
  it('returns slots within pickup period bounds', () => {
    const site = makeSite()
    const monday = new Date('2026-06-01T10:00:00+02:00')

    const slots = getAvailablePickupSlots(site, monday)

    expect(slots.length).toBeGreaterThan(0)
    expect(slots[0].time).toBe('11:00')
    expect(slots.at(-1)?.time).toBe('13:30')
  })

  it('proposes the slot after the next theoretical slot', () => {
    const site = makeSite({
      schedule: {
        weeklyHours: {
          mondayLunch: lunchPeriod('11:00', '14:00'),
          mondayEvening: closedDay(),
          tuesdayLunch: closedDay(),
          tuesdayEvening: closedDay(),
          wednesdayLunch: closedDay(),
          wednesdayEvening: closedDay(),
          thursdayLunch: closedDay(),
          thursdayEvening: closedDay(),
          fridayLunch: closedDay(),
          fridayEvening: closedDay(),
          saturdayLunch: closedDay(),
          saturdayEvening: closedDay(),
          sundayLunch: closedDay(),
          sundayEvening: closedDay(),
        },
      },
      clickAndCollect: {
        manualStatus: 'auto',
        slotDurationMinutes: '15',
      },
    })
    const mondayLunch = new Date('2026-06-01T12:05:00+02:00')

    const slots = getAvailablePickupSlots(site, mondayLunch)

    expect(slots[0]?.time).toBe('12:30')
    expect(slots.some((slot) => slot.time === '12:15')).toBe(false)
  })

  it('respects last pickup slot per period', () => {
    const site = makeSite({
      schedule: {
        weeklyHours: {
          mondayLunch: closedDay(),
          mondayEvening: lunchPeriod('19:00', '21:30', '19:00', '22:00'),
          tuesdayLunch: closedDay(),
          tuesdayEvening: closedDay(),
          wednesdayLunch: closedDay(),
          wednesdayEvening: closedDay(),
          thursdayLunch: closedDay(),
          thursdayEvening: closedDay(),
          fridayLunch: closedDay(),
          fridayEvening: closedDay(),
          saturdayLunch: closedDay(),
          saturdayEvening: closedDay(),
          sundayLunch: closedDay(),
          sundayEvening: closedDay(),
        },
      },
      clickAndCollect: {
        manualStatus: 'auto',
        slotDurationMinutes: '15',
      },
    })
    const mondayEvening = new Date('2026-06-01T19:00:00+02:00')

    const slots = getAvailablePickupSlots(site, mondayEvening)

    expect(slots.at(-1)?.time).toBe('21:30')
    expect(slots.some((slot) => slot.time === '21:45')).toBe(false)
  })

  it('only returns slots for the current day', () => {
    const site = makeSite({
      schedule: {
        weeklyHours: {
          mondayLunch: lunchPeriod('11:00', '13:30'),
          mondayEvening: closedDay(),
          tuesdayLunch: lunchPeriod('11:00', '13:30'),
          tuesdayEvening: closedDay(),
          wednesdayLunch: closedDay(),
          wednesdayEvening: closedDay(),
          thursdayLunch: closedDay(),
          thursdayEvening: closedDay(),
          fridayLunch: closedDay(),
          fridayEvening: closedDay(),
          saturdayLunch: closedDay(),
          saturdayEvening: closedDay(),
          sundayLunch: closedDay(),
          sundayEvening: closedDay(),
        },
      },
    })
    const mondayAfterClosing = new Date('2026-06-01T14:00:00+02:00')

    const slots = getAvailablePickupSlots(site, mondayAfterClosing)

    expect(slots).toHaveLength(0)
    expect(slots.every((slot) => slot.dateKey === '2026-06-01')).toBe(true)
  })
})

describe('getSiteStatusBanner', () => {
  it('uses restaurant hours for open status and pickup slots for availability', () => {
    const site = makeSite({
      schedule: {
        weeklyHours: {
          mondayLunch: closedDay(),
          mondayEvening: lunchPeriod('19:00', '21:30', '19:00', '22:00'),
          tuesdayLunch: closedDay(),
          tuesdayEvening: closedDay(),
          wednesdayLunch: closedDay(),
          wednesdayEvening: closedDay(),
          thursdayLunch: closedDay(),
          thursdayEvening: closedDay(),
          fridayLunch: closedDay(),
          fridayEvening: closedDay(),
          saturdayLunch: closedDay(),
          saturdayEvening: closedDay(),
          sundayLunch: closedDay(),
          sundayEvening: closedDay(),
        },
      },
      clickAndCollect: {
        manualStatus: 'auto',
        slotDurationMinutes: '15',
      },
    })
    const mondayEvening = new Date('2026-06-01T20:00:00+02:00')

    expect(isRestaurantOpen(site, mondayEvening)).toBe(true)

    const banner = getSiteStatusBanner(site, mondayEvening)

    expect(banner.restaurantOpen).toBe(true)
    expect(banner.clickAndCollectAvailable).toBe(true)
    expect(banner.clickAndCollectMessage).toContain("jusqu'à 21h30")
  })
})
