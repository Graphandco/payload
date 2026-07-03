/**
 * Résolution SEO par chemin tenant : pages indexables vs noindex.
 */
import type { Metadata } from '@/lib/seo/nextTypes'
import type { Site } from '@/payload-types'
import { getSitePublicUrl } from '@/lib/getSitePublicUrl'
import {
  getSiteSeoConfig,
  type IndexablePageKey,
} from '@/lib/seo/siteSeoConfig'
import { getSiteLayoutIcons, getSiteOgImagePath } from '@/lib/seo/siteBranding'
import { hasCustomHome } from '@/lib/loadCustomHome'

export const NOINDEX_ROBOTS: Metadata['robots'] = {
  index: false,
  follow: false,
}

const INDEXABLE_PATHS = new Set<string>(['', 'accueil', 'carte', 'contact'])

export function resolveIndexablePageKey(path: string): IndexablePageKey | null {
  if (path === '' || path === 'accueil') {
    return 'home'
  }

  if (path === 'carte') {
    return 'carte'
  }

  if (path === 'contact') {
    return 'contact'
  }

  return null
}

export function isIndexableTenantPath(siteSlug: string, path: string): boolean {
  if (INDEXABLE_PATHS.has(path)) {
    return true
  }

  if (path === '' && hasCustomHome(siteSlug)) {
    return true
  }

  return false
}

export function resolveTenantPathFromSlug(slug?: string[]): string {
  return slug?.join('/') ?? ''
}

function buildAbsoluteAssetUrl(site: Pick<Site, 'slug' | 'domain'>, assetPath: string): string {
  return getSitePublicUrl(site, assetPath)
}

function buildOpenGraph(
  site: Pick<Site, 'name' | 'slug' | 'domain'>,
  options: { title: string; description: string; path: string },
): Metadata['openGraph'] {
  const url = getSitePublicUrl(site, options.path === '' ? '/' : `/${options.path}`)
  const imageUrl = buildAbsoluteAssetUrl(site, getSiteOgImagePath(site.slug))

  return {
    title: options.title,
    description: options.description,
    url,
    siteName: site.name,
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: site.name,
      },
    ],
  }
}

export function buildTenantLayoutMetadata(site: Site): Metadata {
  const seo = getSiteSeoConfig(site.slug)
  const metadataBase = new URL(getSitePublicUrl(site, '/'))

  return {
    metadataBase,
    title: {
      default: seo.defaultTitle,
      template: `%s | ${site.name}`,
    },
    description: seo.defaultDescription,
    applicationName: seo.shortName,
    manifest: '/manifest.webmanifest',
    icons: getSiteLayoutIcons(site.slug),
    appleWebApp: {
      capable: true,
      title: seo.shortName,
      statusBarStyle: 'default',
    },
    formatDetection: {
      telephone: false,
    },
    other: {
      'mobile-web-app-capable': 'yes',
    },
  }
}

export function buildTenantPageMetadata(site: Site, path: string): Metadata {
  const seo = getSiteSeoConfig(site.slug)
  const indexableKey = resolveIndexablePageKey(path)

  if (!indexableKey || !isIndexableTenantPath(site.slug, path)) {
    const privateTitle =
      path === 'panier'
        ? 'Panier'
        : path.startsWith('commande')
          ? 'Commande'
          : path === 'cuisine'
            ? 'Cuisine'
            : path === 'commandes'
              ? 'Commandes'
              : 'Espace privé'

    return {
      title: privateTitle,
      robots: NOINDEX_ROBOTS,
    }
  }

  const pageSeo = seo.pages[indexableKey]
  const title = pageSeo?.title ?? seo.defaultTitle
  const description = pageSeo?.description ?? seo.defaultDescription
  const canonicalPath = indexableKey === 'home' ? '/' : `/${indexableKey === 'carte' ? 'carte' : 'contact'}`

  return {
    title,
    description,
    alternates: {
      canonical: getSitePublicUrl(site, canonicalPath),
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: buildOpenGraph(site, {
      title,
      description,
      path: indexableKey === 'home' ? '' : indexableKey === 'carte' ? 'carte' : 'contact',
    }),
  }
}

export function getIndexableSitemapPaths(): string[] {
  return ['', 'carte', 'contact']
}
