import { getSiteByTenant } from '@/lib/getSiteByTenant'
import { getSitePublicDomain } from '@/lib/siteDomain'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ domain: string }>
}

export default async function TenantHomePage({ params }: Props) {
  const { domain: tenantKey } = await params
  const site = await getSiteByTenant(tenantKey)

  if (!site) {
    notFound()
  }

  return (
    <main>
      <h1>{site.name}</h1>
      <p>Slug : {site.slug}</p>
      <p>Domaine : {getSitePublicDomain(site.slug, site.domain)}</p>
    </main>
  )
}
