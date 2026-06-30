/**
 * GET /api/orders/staff — liste paginée des commandes pour /commandes.
 */
import { getOrdersPageLimit, listStaffOrders } from '@/lib/orders/listStaffOrders'
import { requireSiteStaffAccess } from '@/lib/requireSiteStaffAccess'
import { z } from 'zod'

const querySchema = z.object({
  siteId: z.coerce.number().int().positive(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(getOrdersPageLimit()),
  search: z.string().trim().optional(),
})

export async function GET(request: Request) {
  const url = new URL(request.url)
  const parsed = querySchema.safeParse({
    siteId: url.searchParams.get('siteId'),
    page: url.searchParams.get('page') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
    search: url.searchParams.get('search') ?? undefined,
  })

  if (!parsed.success) {
    return Response.json(
      { error: 'INVALID_QUERY', message: 'Paramètres de requête invalides.' },
      { status: 400 },
    )
  }

  const { siteId, page, limit, search } = parsed.data
  const access = await requireSiteStaffAccess(request, siteId)

  if (!access.ok) {
    return Response.json({ error: 'FORBIDDEN', message: access.message }, { status: access.status })
  }

  try {
    const result = await listStaffOrders(siteId, page, limit, search)
    return Response.json(result)
  } catch (error) {
    console.error('[GET /api/orders/staff]', error)
    return Response.json({ error: 'INTERNAL_ERROR', message: 'Une erreur est survenue.' }, { status: 500 })
  }
}
