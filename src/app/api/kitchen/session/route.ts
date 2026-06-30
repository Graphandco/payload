/**
 * GET /api/kitchen/session — état de connexion cuisine pour un site.
 *
 * Appelé par KitchenGate au chargement et après login.
 * Retourne { authenticated: true, email } ou 401/403.
 */
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
      { authenticated: false, error: 'INVALID_QUERY', message: 'Paramètre siteId invalide.' },
      { status: 400 },
    )
  }

  const { siteId } = parsed.data
  const access = await requireKitchenAccess(request, siteId)

  if (!access.ok) {
    return Response.json(
      { authenticated: false, message: access.message },
      { status: access.status },
    )
  }

  return Response.json({ authenticated: true, email: access.email })
}
