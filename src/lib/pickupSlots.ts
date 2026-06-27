/**
 * Calcul des créneaux de retrait proposables à partir des horaires du site
 * (hebdo, exceptions, délai minimum, durée de créneau).
 */
import type { Site } from '@/payload-types'
import { getEffectiveDaySchedule, getParisMinutesFromMidnight } from './siteSchedule'

const PARIS_TZ = 'Europe/Paris'
const MAX_DAYS_AHEAD = 7
const MAX_SLOTS = 48

export type PickupSlot = {
  value: string
  dateKey: string
  time: string
  label: string
}

function parseTimeParts(hhmm: string): { h: number; min: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim())
  if (!match) {
    return null
  }

  const h = Number(match[1])
  const min = Number(match[2])
  if (h < 0 || h > 23 || min < 0 || min > 59) {
    return null
  }

  return { h, min }
}

function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const min = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

function ceilToSlot(minutes: number, duration: number): number {
  return Math.ceil(minutes / duration) * duration
}

function toDateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function addDays(y: number, m: number, d: number, days: number): { y: number; m: number; d: number } {
  const date = new Date(Date.UTC(y, m - 1, d + days))
  return {
    y: date.getUTCFullYear(),
    m: date.getUTCMonth() + 1,
    d: date.getUTCDate(),
  }
}

function getParisCalendarAt(y: number, m: number, d: number, hour = 12): Date {
  const winter = new Date(Date.UTC(y, m - 1, d, hour - 1, 0, 0))
  const summer = new Date(Date.UTC(y, m - 1, d, hour - 2, 0, 0))
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: PARIS_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const target = toDateKey(y, m, d)
  if (formatter.format(winter).startsWith(target)) {
    return winter
  }

  return summer
}

function formatSlotLabel(dateKey: string, time: string, now: Date): string {
  const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey)
  if (!parsed) {
    return `${dateKey} à ${time}`
  }

  const slotDate = getParisCalendarAt(Number(parsed[1]), Number(parsed[2]), Number(parsed[3]))
  const todayKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: PARIS_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)

  const dayLabel =
    dateKey === todayKey
      ? "Aujourd'hui"
      : new Intl.DateTimeFormat('fr-FR', {
          timeZone: PARIS_TZ,
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(slotDate)

  return `${dayLabel} à ${time}`
}

function getSlotDurationMinutes(site: Site): number {
  const raw = site.clickAndCollect?.slotDurationMinutes ?? '30'
  const duration = Number(raw)
  return duration > 0 ? duration : 30
}

function getMinLeadTimeMinutes(site: Site): number {
  const lead = site.clickAndCollect?.minLeadTimeMinutes
  if (typeof lead === 'number' && lead >= 0) {
    return lead
  }

  if (typeof lead === 'string' && lead.trim() !== '') {
    const parsed = Number(lead)
    if (!Number.isNaN(parsed) && parsed >= 0) {
      return parsed
    }
  }

  return 30
}

function getMaxDaysAhead(site: Site): number {
  return site.clickAndCollect?.sameDayOnly !== false ? 1 : 7
}

function getLastPickupSlotStartMinutes(
  site: Site,
  closeMin: number,
  duration: number,
): number {
  const raw = site.clickAndCollect?.lastPickupSlotTime
  if (typeof raw === 'string' && raw.trim() !== '') {
    const parsed = parseTimeParts(raw)
    if (parsed) {
      return parsed.h * 60 + parsed.min
    }
  }

  return closeMin - duration
}

function getFirstSlotStartMinutes(openMin: number, duration: number): number {
  const aligned = ceilToSlot(openMin, duration)
  return aligned <= openMin ? aligned + duration : aligned
}

function generateSlotsForWindows(
  site: Site,
  dateKey: string,
  windows: { open: string; close: string }[],
  earliestMinutes: number | null,
  now: Date,
): PickupSlot[] {
  const duration = getSlotDurationMinutes(site)
  const slots: PickupSlot[] = []

  for (const window of windows) {
    const open = parseTimeParts(window.open)
    const close = parseTimeParts(window.close)
    if (!open || !close) {
      continue
    }

    let openMin = open.h * 60 + open.min
    let closeMin = close.h * 60 + close.min

    if (closeMin <= openMin) {
      closeMin = 24 * 60
    }

    const lastSlotStart = Math.min(getLastPickupSlotStartMinutes(site, closeMin, duration), closeMin - duration)
    let current = getFirstSlotStartMinutes(openMin, duration)

    while (current <= lastSlotStart) {
      if (earliestMinutes === null || current >= earliestMinutes) {
        const time = minutesToTime(current)
        slots.push({
          value: `${dateKey}T${time}`,
          dateKey,
          time,
          label: formatSlotLabel(dateKey, time, now),
        })
      }

      current += duration
    }
  }

  return slots
}

export function getAvailablePickupSlots(site: Site, at: Date = new Date()): PickupSlot[] {
  const todayParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: PARIS_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .formatToParts(at)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== 'literal') {
        acc[part.type] = part.value
      }
      return acc
    }, {})

  const startY = Number(todayParts.year)
  const startM = Number(todayParts.month)
  const startD = Number(todayParts.day)

  const leadTime = getMinLeadTimeMinutes(site)
  const earliestToday = getParisMinutesFromMidnight(at) + leadTime

  const slots: PickupSlot[] = []
  const maxDaysAhead = getMaxDaysAhead(site)

  for (let dayOffset = 0; dayOffset < maxDaysAhead; dayOffset += 1) {
    const { y, m, d } = addDays(startY, startM, startD, dayOffset)
    const dateKey = toDateKey(y, m, d)
    const dayDate = getParisCalendarAt(y, m, d)
    const daySchedule = getEffectiveDaySchedule(site, dayDate)

    if (daySchedule.closed || daySchedule.slots.length === 0) {
      continue
    }

    const earliestMinutes = dayOffset === 0 ? ceilToSlot(earliestToday, getSlotDurationMinutes(site)) : null

    slots.push(
      ...generateSlotsForWindows(site, dateKey, daySchedule.slots, earliestMinutes, at),
    )

    if (slots.length >= MAX_SLOTS) {
      break
    }
  }

  return slots.slice(0, MAX_SLOTS)
}

export function formatPickupSlotValue(value: string, now: Date = new Date()): string {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(value)
  if (!match) {
    return value
  }

  return formatSlotLabel(match[1], match[2], now)
}
