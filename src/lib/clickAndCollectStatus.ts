/**
 * Statut restaurant (horaires) et click & collect (créneaux commandables) pour le bandeau client.
 */
import type { Site } from '@/payload-types'
import { getAvailablePickupSlots, type PickupSlot } from '@/lib/pickupSlots'
import { getEffectiveDaySchedule, getParisMinutesFromMidnight, isWithinSlots } from '@/lib/siteSchedule'

export type SiteStatusBanner = {
  restaurantOpen: boolean
  restaurantMessage: string
  clickAndCollectAvailable: boolean
  clickAndCollectMessage: string
}

function formatTimeShort(time: string): string {
  return time.replace(':', 'h')
}

function getLastSlotLabel(slots: PickupSlot[]): string | null {
  const last = slots.at(-1)
  if (!last) {
    return null
  }

  if (last.label.startsWith("Aujourd'hui")) {
    return formatTimeShort(last.time)
  }

  return last.label
}

export function isRestaurantOpen(site: Site, at: Date = new Date()): boolean {
  const day = getEffectiveDaySchedule(site, at)
  if (day.closed || day.slots.length === 0) {
    return false
  }

  return isWithinSlots(at, day.slots)
}

export function isClickAndCollectManuallyClosed(site: Site): boolean {
  return site.clickAndCollect?.manualStatus === 'closed'
}

export function canPlaceClickAndCollectOrder(site: Site, at: Date = new Date()): boolean {
  if (isClickAndCollectManuallyClosed(site)) {
    return false
  }

  return getAvailablePickupSlots(site, at).length > 0
}

export function getSiteStatusBanner(site: Site, at: Date = new Date()): SiteStatusBanner {
  const restaurantOpen = isRestaurantOpen(site, at)
  const day = getEffectiveDaySchedule(site, at)

  let restaurantMessage = 'Restaurant ouvert'
  if (!restaurantOpen) {
    if (day.closed) {
      restaurantMessage = day.label
        ? `Restaurant fermé : ${day.label}`
        : "Restaurant fermé aujourd'hui"
    } else if (day.slots.length === 0) {
      restaurantMessage = "Restaurant fermé aujourd'hui"
    } else {
      const now = getParisMinutesFromMidnight(at)
      const firstOpen = day.slots[0]?.open
      restaurantMessage = firstOpen
        ? `Restaurant fermé — ouverture à ${formatTimeShort(firstOpen)}`
        : 'Restaurant fermé pour le moment'
    }
  }

  if (isClickAndCollectManuallyClosed(site)) {
    return {
      restaurantOpen,
      restaurantMessage,
      clickAndCollectAvailable: false,
      clickAndCollectMessage: 'Click & collect indisponible pour le moment',
    }
  }

  const slots = getAvailablePickupSlots(site, at)
  const lastSlotLabel = getLastSlotLabel(slots)

  if (slots.length === 0 || !lastSlotLabel) {
    return {
      restaurantOpen,
      restaurantMessage,
      clickAndCollectAvailable: false,
      clickAndCollectMessage: 'Click & collect indisponible pour le moment',
    }
  }

  return {
    restaurantOpen,
    restaurantMessage,
    clickAndCollectAvailable: true,
    clickAndCollectMessage: `Click & collect disponible jusqu'à ${lastSlotLabel}`,
  }
}
