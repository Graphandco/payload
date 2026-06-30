/**
 * Accès staff (cuisine, commandes, factures) : session Payload + scope site.
 */
import configPromise from '@payload-config'
import { getUserSiteIDsFromReq, userIsAdmin } from '@/lib/siteAccess'
import { createPayloadRequest } from 'payload'

export type SiteStaffAccessResult =
  | { ok: true; email: string }
  | { ok: false; status: 401 | 403; message: string }

export async function requireSiteStaffAccess(
  request: Request,
  siteId: number,
): Promise<SiteStaffAccessResult> {
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
