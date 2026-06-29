/**
 * Endpoint public de création de commande (checkout). Délègue à createOrder.
 */
import { createOrder, CreateOrderError } from '@/lib/createOrder'
import { getRequestOrigin } from '@/lib/getSitePublicUrl'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const origin = getRequestOrigin(request)
    const order = await createOrder(body, { origin })

    return Response.json(order, { status: 201 })
  } catch (error) {
    if (error instanceof CreateOrderError) {
      const status =
        error.code === 'SITE_NOT_FOUND'
          ? 404
          : error.code === 'INVALID_BODY' || error.code === 'INVALID_LINES'
            ? 400
            : error.code === 'PAYMENT_FAILED'
              ? 502
              : 409

      return Response.json({ error: error.code, message: error.message }, { status })
    }

    console.error('[POST /api/orders]', error)
    return Response.json({ error: 'INTERNAL_ERROR', message: 'Une erreur est survenue.' }, { status: 500 })
  }
}
