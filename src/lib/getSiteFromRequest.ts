/**
 * Résout le site Payload à partir du hostname d'une requête HTTP (API, etc.).
 */
import { getSiteByTenant } from '@/lib/getSiteByTenant'
import { getHostnameFromHeaders } from '@/lib/resolveTenantDomain'
import { getTenantKeyFromHostname } from '@/lib/siteDomain'
import type { Site } from '@/payload-types'

export async function getSiteFromRequest(request: Request): Promise<Site | null> {
  const hostname = getHostnameFromHeaders(request.headers)

  if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
    return null
  }

  const tenantKey = getTenantKeyFromHostname(hostname)
  return getSiteByTenant(tenantKey)
}
