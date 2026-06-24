import configPromise from '@payload-config'
import type { Site } from '@/payload-types'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { normalizeSiteDomain } from './siteDomain'

export async function getSiteByTenant(tenantKey: string): Promise<Site | null> {
  const headersList = await headers()
  const tenantDomain = headersList.get('x-tenant-domain')
  const normalizedDomain = tenantDomain ? normalizeSiteDomain(tenantDomain) : null

  const payload = await getPayload({
    config: configPromise,
  })

  const orConditions: { domain?: { equals: string }; slug?: { equals: string } }[] = [
    { slug: { equals: tenantKey } },
  ]

  if (normalizedDomain) {
    orConditions.unshift({ domain: { equals: normalizedDomain } })
  }

  const result = await payload.find({
    collection: 'sites',
    where: {
      or: orConditions,
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return result.docs[0] ?? null
}
