/**
 * Point d'entrée serveur de /commande/suivi/[token].
 */
import { OrderTrackingView } from '@/components/order-tracking/OrderTrackingView'
import { getOrderByTrackingToken } from '@/lib/getOrderByTrackingToken'
import { serializePublicOrderTracking } from '@/lib/orderTracking'
import type { Site } from '@/payload-types'
import { notFound } from 'next/navigation'

export const ORDER_TRACKING_PATH_PREFIX = 'commande/suivi'

type Props = {
  site: Site
  token: string
}

export async function OrderTrackingPage({ site, token }: Props) {
  const order = await getOrderByTrackingToken(site.id, token)

  if (!order) {
    notFound()
  }

  const initialOrder = serializePublicOrderTracking(order, site)

  return <OrderTrackingView site={site} token={token} initialOrder={initialOrder} />
}

export function isOrderTrackingPath(path: string): boolean {
  const parts = path.split('/')
  return parts.length === 3 && parts[0] === 'commande' && parts[1] === 'suivi' && parts[2].length > 0
}

export function parseOrderTrackingToken(path: string): string | null {
  if (!isOrderTrackingPath(path)) {
    return null
  }

  return path.split('/')[2] ?? null
}
