'use client'

import type { Site } from '@/payload-types'
import { getClickAndCollectClosedMessage, isClickAndCollectOpen } from '@/lib/siteSchedule'

type Props = {
  site: Site
}

export function ClickAndCollectStatusBanner({ site }: Props) {
  if (isClickAndCollectOpen(site)) {
    return null
  }

  const message = getClickAndCollectClosedMessage(site)

  if (!message) {
    return null
  }

  return (
    <p
      role="status"
      className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      {message}
    </p>
  )
}
