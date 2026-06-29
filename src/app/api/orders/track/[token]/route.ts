/**
 * GET /api/orders/track/[token] — données publiques de suivi (token + siteId).
 */
import { getOrderByTrackingToken } from '@/lib/getOrderByTrackingToken'
import { serializePublicOrderTracking } from '@/lib/orderTracking'
import configPromise from '@payload-config'
import type { Site } from '@/payload-types'
import { getPayload } from 'payload'
import { z } from 'zod'

const querySchema = z.object({
  siteId: z.coerce.number().int().positive(),
})

type RouteContext = {
  params: Promise<{ token: string }>
}

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params
  const url = new URL(request.url)
  const parsed = querySchema.safeParse({ siteId: url.searchParams.get('siteId') })

  if (!parsed.success) {
    return Response.json(
      { error: 'INVALID_QUERY', message: 'Paramètre siteId invalide.' },
      { status: 400 },
    )
  }

  const { siteId } = parsed.data

  try {
    const payload = await getPayload({ config: configPromise })
    const siteResult = await payload.find({
      collection: 'sites',
      where: { id: { equals: siteId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const site = siteResult.docs[0] as Site | undefined
    if (!site) {
      return Response.json({ error: 'NOT_FOUND', message: 'Site introuvable.' }, { status: 404 })
    }

    const order = await getOrderByTrackingToken(siteId, token)
    if (!order) {
      return Response.json({ error: 'NOT_FOUND', message: 'Commande introuvable.' }, { status: 404 })
    }

    return Response.json({
      order: serializePublicOrderTracking(order, site),
    })
  } catch (error) {
    console.error('[GET /api/orders/track/[token]]', error)
    return Response.json({ error: 'INTERNAL_ERROR', message: 'Une erreur est survenue.' }, { status: 500 })
  }
}
