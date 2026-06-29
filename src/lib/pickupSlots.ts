/**
 * Calcul des créneaux de retrait à partir des périodes click & collect (midi/soir).
 * Uniquement le jour même (pas de commande pour le lendemain).
 * Propose le créneau suivant le prochain créneau théorique (ex. 12h05 → 12h30, pas 12h15).
 */
import type { Site } from '@/payload-types'
import { getEffectiveDaySchedule, getParisDateKey, getParisMinutesFromMidnight } from './siteSchedule'

const PARIS_TZ = 'Europe/Paris'
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

function timeToMinutes(time: string): number | null {
  const parsed = parseTimeParts(time)
  if (!parsed) {
    return null
  }

  return parsed.h * 60 + parsed.min
}

function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const min = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

function ceilToSlot(minutes: number, duration: number): number {
  return Math.ceil(minutes / duration) * duration
}

function getEarliestBookableMinutes(nowMin: number, duration: number): number {
  const nextSlot = ceilToSlot(nowMin, duration)
  return nextSlot + duration
}

function toDateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
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

function generateSlotsForPickupPeriod(
  dateKey: string,
  firstPickupSlot: string,
  lastPickupSlot: string,
  duration: number,
  earliestMinutes: number | null,
  now: Date,
): PickupSlot[] {
  const firstMin = timeToMinutes(firstPickupSlot)
  const lastMin = timeToMinutes(lastPickupSlot)
  if (firstMin === null || lastMin === null || lastMin < firstMin) {
    return []
  }

  const slots: PickupSlot[] = []
  let current = ceilToSlot(firstMin, duration)

  while (current <= lastMin) {
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

  return slots
}

export function getAvailablePickupSlots(site: Site, at: Date = new Date()): PickupSlot[] {
  if (site.clickAndCollect?.manualStatus === 'closed') {
    return []
  }

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

  const y = Number(todayParts.year)
  const m = Number(todayParts.month)
  const d = Number(todayParts.day)
  const dateKey = toDateKey(y, m, d)
  const duration = getSlotDurationMinutes(site)
  const nowMin = getParisMinutesFromMidnight(at)
  const earliestMinutes = getEarliestBookableMinutes(nowMin, duration)

  const daySchedule = getEffectiveDaySchedule(site, getParisCalendarAt(y, m, d))

  if (daySchedule.closed || daySchedule.pickupPeriods.length === 0) {
    return []
  }

  const slots: PickupSlot[] = []

  for (const period of daySchedule.pickupPeriods) {
    slots.push(
      ...generateSlotsForPickupPeriod(
        dateKey,
        period.firstPickupSlot,
        period.lastPickupSlot,
        duration,
        earliestMinutes,
        at,
      ),
    )
  }

  return slots
    .sort((a, b) => a.value.localeCompare(b.value))
    .slice(0, MAX_SLOTS)
}

export function formatPickupSlotValue(value: string, now: Date = new Date()): string {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(value)
  if (!match) {
    return value
  }

  return formatSlotLabel(match[1], match[2], now)
}
