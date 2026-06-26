import { normalizeHostname } from './siteDomain'

/**
 * Hostname public du tenant (prod derrière reverse-proxy ou dev direct).
 */
export function getHostnameFromHeaders(headers: Headers): string | null {
  const raw =
    headers.get('x-tenant-domain') ??
    headers.get('x-forwarded-host') ??
    headers.get('host')

  if (!raw) {
    return null
  }

  return normalizeHostname(raw.split(',')[0]?.trim() ?? raw)
}

/**
 * Slug probable à partir du hostname (ex. graphandco.fr → graphandco).
 * Utile si le champ `domain` n'est pas encore renseigné en admin.
 */
export function getSlugGuessFromHostname(hostname: string): string | null {
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null
  }

  if (hostname.endsWith('.localhost')) {
    return hostname.slice(0, -'.localhost'.length)
  }

  const firstLabel = hostname.split('.')[0]
  return firstLabel || null
}
