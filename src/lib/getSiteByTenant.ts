/**
 * Résout un site Payload à partir de la clé tenant (slug ou domaine)
 * injectée par le middleware via l'en-tête x-tenant-domain.
 */
import configPromise from '@payload-config'
import type { Site } from '@/payload-types'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { getHostnameFromHeaders, getSlugGuessFromHostname } from './resolveTenantDomain'
import { normalizeSiteDomain } from './siteDomain'

export async function getSiteByTenant(tenantKey: string): Promise<Site | null> {
  const headersList = await headers()
  const hostname = getHostnameFromHeaders(headersList)
  const normalizedDomain = hostname ? normalizeSiteDomain(hostname) : null

  const payload = await getPayload({
    config: configPromise,
  })

  const slugCandidates = new Set<string>([tenantKey])

  if (hostname) {
    const slugGuess = getSlugGuessFromHostname(hostname)
    if (slugGuess) {
      slugCandidates.add(slugGuess)
    }
  }

  const orConditions: { domain?: { equals: string }; slug?: { equals: string } }[] = []

  if (normalizedDomain) {
    orConditions.push({ domain: { equals: normalizedDomain } })
  }

  for (const slug of slugCandidates) {
    orConditions.push({ slug: { equals: slug } })
  }

  const result = await payload.find({
    collection: 'sites',
    where: {
      or: orConditions,
    },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })

  return result.docs[0] ?? null
}
