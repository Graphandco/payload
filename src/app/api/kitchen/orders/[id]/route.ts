/**
 * PATCH /api/kitchen/orders/[id] — marquer une commande terminée ou annulée.
 */
import { KitchenOrderError, updateKitchenOrderStatus } from '@/lib/kitchen/kitchenOrders'
import { requireKitchenAccess } from '@/lib/requireKitchenAccess'
import { z } from 'zod'

const bodySchema = z.object({
  siteId: z.number().int().positive(),
  status: z.enum(['completed', 'cancelled']),
})

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const orderId = Number(id)

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return Response.json({ error: 'INVALID_ID', message: 'Identifiant invalide.' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'INVALID_BODY', message: 'Corps de requête invalide.' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'INVALID_BODY', message: 'Données invalides.' }, { status: 400 })
  }

  const { siteId, status } = parsed.data
  const access = await requireKitchenAccess(request, siteId)

  if (!access.ok) {
    return Response.json({ error: 'FORBIDDEN', message: access.message }, { status: access.status })
  }

  try {
    const order = await updateKitchenOrderStatus(siteId, orderId, status)
    return Response.json({ order })
  } catch (error) {
    if (error instanceof KitchenOrderError) {
      const httpStatus = error.code === 'NOT_FOUND' ? 404 : 409
      return Response.json({ error: error.code, message: error.message }, { status: httpStatus })
    }

    console.error('[PATCH /api/kitchen/orders/[id]]', error)
    return Response.json({ error: 'INTERNAL_ERROR', message: 'Une erreur est survenue.' }, { status: 500 })
  }
}
