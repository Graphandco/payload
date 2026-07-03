/**
 * Layout par domaine : charge le site Payload et enveloppe toutes les pages
 * dans le shell approprié (default ou custom, ex. lucelle-app).
 */
import { DefaultSiteShell } from '@/components/layout/DefaultSiteShell'
import { getSiteByTenant } from '@/lib/getSiteByTenant'
import { loadSiteShell } from '@/lib/loadSiteShell'
import { requireSite } from '@/lib/requireSite'
import {
  resolveDomainLayoutMetadata,
  resolveDomainLayoutViewport,
} from '@/lib/seo/domainLayoutSeo'

export async function generateMetadata({
  params,
}: Pick<LayoutProps<'/[domain]'>, 'params'>) {
  const { domain: tenantKey } = await params
  return resolveDomainLayoutMetadata(tenantKey)
}

export async function generateViewport({
  params,
}: Pick<LayoutProps<'/[domain]'>, 'params'>) {
  const { domain: tenantKey } = await params
  return resolveDomainLayoutViewport(tenantKey)
}

export default async function DomainLayout({ children, params }: LayoutProps<'/[domain]'>) {
  const { domain: tenantKey } = await params
  const site = requireSite(await getSiteByTenant(tenantKey))

  const SiteShell = (await loadSiteShell(site.slug)) ?? DefaultSiteShell

  return <SiteShell site={site}>{children}</SiteShell>
}
