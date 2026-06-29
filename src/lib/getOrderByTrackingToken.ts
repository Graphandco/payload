/**
 * Charge une commande par token de suivi, limitée au site courant.
 */
import configPromise from '@payload-config'
import type { Order } from '@/payload-types'
import { getPayload } from 'payload'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidTrackingToken(token: string): boolean {
  return UUID_RE.test(token)
}

export async function getOrderByTrackingToken(
  siteId: number,
  trackingToken: string,
): Promise<Order | null> {
  if (!isValidTrackingToken(trackingToken)) {
    return null
  }

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'orders',
    where: {
      and: [
        { site: { equals: siteId } },
        { trackingToken: { equals: trackingToken } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return result.docs[0] ?? null
}
