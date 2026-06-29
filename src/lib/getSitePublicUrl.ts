/**
 * URL publique d'un site tenant (redirect Mollie, liens absolus).
 */
import type { Site } from '@/payload-types'
import { getSitePublicDomain } from '@/lib/siteDomain'

const DEV_PORT = process.env.PORT ?? '3000'

export function getRequestOrigin(request: Request): string | undefined {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost?.split(',')[0]?.trim() ?? request.headers.get('host')?.trim()
  if (!host) {
    return undefined
  }

  const proto =
    request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase() ?? 'http'

  return `${proto}://${host}`
}

export function getSitePublicUrl(
  site: Pick<Site, 'slug' | 'domain'>,
  path: string,
  options?: { origin?: string },
): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (options?.origin) {
    return `${options.origin.replace(/\/$/, '')}${normalizedPath}`
  }

  const domain = getSitePublicDomain(site.slug, site.domain)
  const isDevLocalhost = domain.endsWith('.localhost')
  const protocol = isDevLocalhost ? 'http' : 'https'
  const port = isDevLocalhost ? `:${DEV_PORT}` : ''

  return `${protocol}://${domain}${port}${normalizedPath}`
}

export function getOrderTrackingUrl(
  site: Pick<Site, 'slug' | 'domain'>,
  trackingToken: string,
  options?: { origin?: string },
): string {
  return getSitePublicUrl(site, `/commande/suivi/${trackingToken}`, options)
}
