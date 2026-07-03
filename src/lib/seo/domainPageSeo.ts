import { getSiteByTenant } from '@/lib/getSiteByTenant'
import { buildTenantPageMetadata, resolveTenantPathFromSlug } from '@/lib/seo/tenantPageSeo'
import type { Metadata } from '@/lib/seo/nextTypes'

export async function resolveDomainPageMetadata(
  tenantKey: string,
  slug?: string[],
): Promise<Metadata> {
  const site = await getSiteByTenant(tenantKey)

  if (!site) {
    return {}
  }

  const path = resolveTenantPathFromSlug(slug)
  return buildTenantPageMetadata(site, path)
}
