import { getSitePublicUrl } from '@/lib/getSitePublicUrl'
import { getSiteFromRequestHeaders } from '@/lib/seo/getSiteFromRequestHeaders'
import { getSiteManifestIcons } from '@/lib/seo/siteBranding'
import { getSiteSeoConfig } from '@/lib/seo/siteSeoConfig'
import { getIndexableSitemapPaths } from '@/lib/seo/tenantPageSeo'
import type { MetadataRoute } from '@/lib/seo/nextTypes'

const FALLBACK_SLUG = 'default'

export async function resolveWebManifest(): Promise<MetadataRoute.Manifest> {
  const site = await getSiteFromRequestHeaders()
  const siteSlug = site?.slug ?? FALLBACK_SLUG
  const seo = getSiteSeoConfig(siteSlug)

  return {
    name: site?.name ?? seo.defaultTitle,
    short_name: seo.shortName,
    description: seo.defaultDescription,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    theme_color: seo.themeColor,
    background_color: seo.backgroundColor,
    icons: getSiteManifestIcons(siteSlug),
  }
}

export async function resolveSitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteFromRequestHeaders()

  if (!site) {
    return []
  }

  return getIndexableSitemapPaths().map((path) => ({
    url: getSitePublicUrl(site, path === '' ? '/' : `/${path}`),
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.8,
  }))
}

export async function resolveRobots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteFromRequestHeaders()
  const siteUrl = site
    ? getSitePublicUrl(site, '/')
    : process.env.NEXT_PUBLIC_SERVER_URL || 'https://youclickyoucollect.fr'

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/carte', '/contact'],
      disallow: [
        '/panier',
        '/commande',
        '/commande/',
        '/cuisine',
        '/commandes',
        '/admin',
        '/api',
        '/mentions-legales',
        '/politique-de-confidentialite',
      ],
    },
    sitemap: `${siteUrl.replace(/\/$/, '')}/sitemap.xml`,
  }
}
