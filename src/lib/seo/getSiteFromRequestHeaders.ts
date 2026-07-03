/**
 * Résout le site Payload à partir du hostname de la requête (manifest, sitemap, robots).
 */
import { getSiteByTenant } from '@/lib/getSiteByTenant'
import { getHostnameFromHeaders } from '@/lib/resolveTenantDomain'
import { getTenantKeyFromHostname } from '@/lib/siteDomain'
import type { Site } from '@/payload-types'
import { headers } from 'next/headers'

export async function getSiteFromRequestHeaders(): Promise<Site | null> {
  const headersList = await headers()
  const hostname = getHostnameFromHeaders(headersList)

  if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
    return null
  }

  const tenantKey = getTenantKeyFromHostname(hostname)
  return getSiteByTenant(tenantKey)
}
