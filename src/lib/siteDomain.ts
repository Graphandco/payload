const DEV_LOCALHOST_SUFFIX = '.localhost'

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
