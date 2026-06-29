'use client'

import { useRowLabel } from '@payloadcms/ui'

const PARIS_TZ = 'Europe/Paris'

function formatExceptionDate(value: string): string {
  const normalized = value.includes('T') ? value : `${value}T12:00:00.000Z`
  const date = new Date(normalized)

  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: PARIS_TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function ScheduleExceptionRowLabel() {
  const { data } = useRowLabel<{
    startDate?: string
    endDate?: string
    label?: string
  }>()

  if (!data?.startDate) {
    return <span>Jour particulier</span>
  }

  const startLabel = formatExceptionDate(data.startDate)
  const endLabel =
    data.endDate && data.endDate !== data.startDate
      ? formatExceptionDate(data.endDate)
      : null

  const dateLabel = endLabel ? `${startLabel} → ${endLabel}` : startLabel

  if (data.label) {
    return (
      <span>
        {dateLabel} — {data.label}
      </span>
    )
  }

  return <span>{dateLabel}</span>
}
