/**
 * GET /api/kitchen/orders — commandes en cours pour l'écran cuisine.
 */
import { KitchenOrderError, listKitchenOrders } from '@/lib/kitchen/kitchenOrders'
import { requireKitchenAccess } from '@/lib/requireKitchenAccess'
import { z } from 'zod'

const querySchema = z.object({
  siteId: z.coerce.number().int().positive(),
})

export async function GET(request: Request) {
  const url = new URL(request.url)
  const parsed = querySchema.safeParse({ siteId: url.searchParams.get('siteId') })

  if (!parsed.success) {
    return Response.json(
      { error: 'INVALID_QUERY', message: 'Paramètre siteId invalide.' },
      { status: 400 },
    )
  }

  const { siteId } = parsed.data
  const access = await requireKitchenAccess(request, siteId)

  if (!access.ok) {
    return Response.json({ error: 'FORBIDDEN', message: access.message }, { status: access.status })
  }

  try {
    const orders = await listKitchenOrders(siteId)
    return Response.json({ orders })
  } catch (error) {
    console.error('[GET /api/kitchen/orders]', error)
    return Response.json({ error: 'INTERNAL_ERROR', message: 'Une erreur est survenue.' }, { status: 500 })
  }
}
