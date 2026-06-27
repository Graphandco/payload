/**
 * Horaires effectifs et statut click & collect (fuseau Europe/Paris).
 * Combine horaires hebdomadaires, exceptions calendrier et statut manuel du site.
 */
import type { Site } from '@/payload-types'

export const WEEKDAYS = [
  { label: 'Lundi', value: 'monday' },
  { label: 'Mardi', value: 'tuesday' },
  { label: 'Mercredi', value: 'wednesday' },
  { label: 'Jeudi', value: 'thursday' },
  { label: 'Vendredi', value: 'friday' },
  { label: 'Samedi', value: 'saturday' },
  { label: 'Dimanche', value: 'sunday' },
] as const

export type Weekday = (typeof WEEKDAYS)[number]['value']

export type TimeSlot = {
  open: string
  close: string
}

export type WeeklyDaySchedule = {
  closed?: boolean | null
  slots?: TimeSlot[] | null
}

export type EffectiveDaySchedule = {
  closed: boolean
  slots: TimeSlot[]
  label?: string | null
  note?: string | null
  source: 'weekly' | 'exception_closed' | 'exception_custom' | 'none'
}

const PARIS_TZ = 'Europe/Paris'

const weekdayByIndex: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

function getParisCalendarDate(date: Date): { y: number; m: number; d: number; weekday: Weekday } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: PARIS_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  const weekdayShort = get('weekday')
  const weekdayMap: Record<string, Weekday> = {
    Mon: 'monday',
    Tue: 'tuesday',
    Wed: 'wednesday',
    Thu: 'thursday',
    Fri: 'friday',
    Sat: 'saturday',
    Sun: 'sunday',
  }

  return {
    y: Number(get('year')),
    m: Number(get('month')),
    d: Number(get('day')),
    weekday: weekdayMap[weekdayShort] ?? weekdayByIndex[date.getUTCDay()],
  }
}

function toDateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function parseDateKey(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) {
    return null
  }

  return {
    y: Number(match[1]),
    m: Number(match[2]),
    d: Number(match[3]),
  }
}

function isDateInRange(
  target: { y: number; m: number; d: number },
  start: string,
  end?: string | null,
): boolean {
  const startKey = parseDateKey(start)
  if (!startKey) {
    return false
  }

  const endKey = parseDateKey(end ?? start) ?? startKey
  const targetKey = toDateKey(target.y, target.m, target.d)
  const startStr = toDateKey(startKey.y, startKey.m, startKey.d)
  const endStr = toDateKey(endKey.y, endKey.m, endKey.d)

  return targetKey >= startStr && targetKey <= endStr
}

function getWeeklySlotsForDay(site: Site, weekday: Weekday): TimeSlot[] {
  const dayConfig = site.schedule?.weeklyHours?.[weekday]
  if (!dayConfig || dayConfig.closed) {
    return []
  }

  if (!dayConfig.slots?.length) {
    return []
  }

  return dayConfig.slots
    .filter((slot): slot is TimeSlot => Boolean(slot?.open && slot?.close))
    .map((slot) => ({ open: slot.open, close: slot.close }))
}

export function getEffectiveDaySchedule(site: Site, at: Date = new Date()): EffectiveDaySchedule {
  const calendar = getParisCalendarDate(at)
  const exceptions = site.schedule?.exceptions ?? []

  const matchingException = exceptions.find((exception) => {
    if (!exception?.startDate) {
      return false
    }

    return isDateInRange(calendar, exception.startDate, exception.endDate)
  })

  if (matchingException) {
    if (matchingException.type === 'closed') {
      return {
        closed: true,
        slots: [],
        label: matchingException.label,
        note: matchingException.note,
        source: 'exception_closed',
      }
    }

    const slots =
      matchingException.customHours
        ?.filter((slot): slot is TimeSlot => Boolean(slot?.open && slot?.close))
        .map((slot) => ({ open: slot.open, close: slot.close })) ?? []

    return {
      closed: slots.length === 0,
      slots,
      label: matchingException.label,
      note: matchingException.note,
      source: 'exception_custom',
    }
  }

  const slots = getWeeklySlotsForDay(site, calendar.weekday)

  return {
    closed: slots.length === 0,
    slots,
    source: slots.length > 0 ? 'weekly' : 'none',
  }
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

/** Minutes depuis minuit (fuseau Paris) pour un instant donné. */
export function getParisMinutesFromMidnight(at: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: PARIS_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(at)

  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0)

  return hour * 60 + minute
}

export function isWithinSlots(at: Date, slots: TimeSlot[]): boolean {
  if (slots.length === 0) {
    return false
  }

  const now = getParisMinutesFromMidnight(at)

  return slots.some((slot) => {
    const open = parseTimeParts(slot.open)
    const close = parseTimeParts(slot.close)
    if (!open || !close) {
      return false
    }

    const openMin = open.h * 60 + open.min
    const closeMin = close.h * 60 + close.min

    if (closeMin <= openMin) {
      return now >= openMin || now < closeMin
    }

    return now >= openMin && now < closeMin
  })
}

export function isClickAndCollectOpen(site: Site, at: Date = new Date()): boolean {
  const config = site.clickAndCollect
  const manualStatus = config?.manualStatus ?? 'auto'

  if (manualStatus === 'closed') {
    return false
  }

  if (manualStatus === 'open') {
    return true
  }

  const respectSchedule = config?.enabledBySchedule !== false
  if (!respectSchedule) {
    return true
  }

  const day = getEffectiveDaySchedule(site, at)
  if (day.closed) {
    return false
  }

  return isWithinSlots(at, day.slots)
}

export function getClickAndCollectClosedMessage(site: Site, at: Date = new Date()): string | null {
  if (isClickAndCollectOpen(site, at)) {
    return null
  }

  const day = getEffectiveDaySchedule(site, at)
  if (day.note) {
    return day.note
  }

  if (day.label && day.source === 'exception_closed') {
    return `Click & collect fermé : ${day.label}.`
  }

  const manualStatus = site.clickAndCollect?.manualStatus ?? 'auto'
  if (manualStatus === 'closed') {
    return 'Click & collect temporairement fermé.'
  }

  if (day.closed) {
    return "Click & collect fermé aujourd'hui."
  }

  return 'Click & collect fermé pour le moment.'
}
