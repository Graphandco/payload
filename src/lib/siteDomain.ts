const DEV_LOCALHOST_SUFFIX = '.localhost'

export function normalizeHostname(host: string): string {
  const withoutPort = host.split(':')[0]
  return withoutPort.replace(/^www\./, '').toLowerCase()
}

export function getTenantKeyFromHostname(hostname: string): string {
  const domain = normalizeHostname(hostname)

  if (domain.endsWith(DEV_LOCALHOST_SUFFIX)) {
    return domain.slice(0, -DEV_LOCALHOST_SUFFIX.length)
  }

  return domain.replace(/\./g, '-')
}

export function getDevDomainFromSlug(slug: string): string {
  return `${slug.trim().toLowerCase()}${DEV_LOCALHOST_SUFFIX}`
}

export function normalizeSiteDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/^www\./, '')
}

/**
 * Domaine public du site : champ `domain` en prod, `{slug}.localhost` en dev si vide.
 */
export function getSitePublicDomain(slug: string, domain?: string | null): string {
  const trimmed = domain?.trim()
  if (trimmed) {
    return normalizeSiteDomain(trimmed)
  }

  return getDevDomainFromSlug(slug)
}
