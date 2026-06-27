/**
 * Bandeau client : statut click & collect (et optionnellement restaurant).
 */
'use client'

import { getSiteStatusBanner } from '@/lib/clickAndCollectStatus'
import { cn } from '@/lib/utils'
import type { Site } from '@/payload-types'

type Props = {
  site: Site
  /** N'affiche le bandeau que si le click & collect est indisponible, sans statut restaurant. */
  unavailableOnly?: boolean
}

export function ClickAndCollectStatusBanner({
  site,
  unavailableOnly = false,
}: Props) {
  const status = getSiteStatusBanner(site)

  if (unavailableOnly && status.clickAndCollectAvailable) {
    return null
  }

  return (
    <div
      role="status"
      className={cn(
        'rounded-lg border px-4 py-3 text-sm',
        unavailableOnly || !status.restaurantOpen
          ? 'border-amber-200 bg-amber-50 text-amber-950'
          : 'border-green-200 bg-green-50 text-green-950',
      )}
    >
      {!unavailableOnly ? (
        <>
          <p className="font-medium">{status.restaurantMessage}</p>
          <p
            className={cn(
              'mt-1',
              status.clickAndCollectAvailable ? 'text-green-900' : 'text-amber-900',
            )}
          >
            {status.clickAndCollectMessage}
          </p>
        </>
      ) : (
        <p className="font-medium text-amber-900">{status.clickAndCollectMessage}</p>
      )}
    </div>
  )
}
