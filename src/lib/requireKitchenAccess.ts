/**
 * Contrôle d'accès API et session cuisine.
 *
 * Lit le cookie Payload (même session que /admin) via createPayloadRequest.
 * Autorisé si :
 *   - role admin (tous les sites), ou
 *   - role editor avec le siteId dans user.sites
 *
 * Utilisé par GET /api/kitchen/session et les routes /api/kitchen/orders.
 */
import configPromise from '@payload-config'
import { getUserSiteIDsFromReq, userIsAdmin } from '@/lib/siteAccess'
import { createPayloadRequest } from 'payload'

export type KitchenAccessResult =
  | { ok: true; email: string }
  | { ok: false; status: 401 | 403; message: string }

export async function requireKitchenAccess(
  request: Request,
  siteId: number,
): Promise<KitchenAccessResult> {
  const req = await createPayloadRequest({
    config: configPromise,
    request,
  })

  if (!req.user) {
    return { ok: false, status: 401, message: 'Connexion requise.' }
  }

  if (await userIsAdmin(req)) {
    const email = typeof req.user.email === 'string' ? req.user.email : ''
    return { ok: true, email }
  }

  const siteIDs = await getUserSiteIDsFromReq(req)
  const hasAccess = siteIDs.some((id) => Number(id) === siteId)

  if (!hasAccess) {
    return {
      ok: false,
      status: 403,
      message: 'Accès refusé pour ce restaurant.',
    }
  }

  const email = typeof req.user.email === 'string' ? req.user.email : ''
  return { ok: true, email }
}
