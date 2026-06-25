import { DefaultSiteShell } from '@/components/layout/DefaultSiteShell'
import { getSiteByTenant } from '@/lib/getSiteByTenant'
import { loadSiteShell } from '@/lib/loadSiteShell'
import { notFound } from 'next/navigation'

type Props = {
  children: React.ReactNode
  params: Promise<{ domain: string }>
}

export default async function DomainLayout({ children, params }: Props) {
  const { domain: tenantKey } = await params
  const site = await getSiteByTenant(tenantKey)

  if (!site) {
    notFound()
  }

  const SiteShell = (await loadSiteShell(site.slug)) ?? DefaultSiteShell

  return <SiteShell site={site}>{children}</SiteShell>
}
