import { getSiteByTenant } from '@/lib/getSiteByTenant'
import { getSiteSeoConfig } from '@/lib/seo/siteSeoConfig'
import { buildTenantLayoutMetadata } from '@/lib/seo/tenantPageSeo'
import type { Metadata, Viewport } from '@/lib/seo/nextTypes'

export async function resolveDomainLayoutMetadata(tenantKey: string): Promise<Metadata> {
  const site = await getSiteByTenant(tenantKey)

  if (!site) {
    return {}
  }

  return buildTenantLayoutMetadata(site)
}

export async function resolveDomainLayoutViewport(tenantKey: string): Promise<Viewport> {
  const site = await getSiteByTenant(tenantKey)

  if (!site) {
    return {}
  }

  const seo = getSiteSeoConfig(site.slug)

  return {
    themeColor: seo.themeColor,
  }
}
