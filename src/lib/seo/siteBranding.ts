/**
 * Chemins des assets PWA / SEO dans public/sites/{slug}/.
 *
 * Chaque restaurant a son dossier (même slug que Payload). Les fichiers attendus :
 * og-image.jpg, maskable.png, logo192|256|384|512.png, favicon-16x16.png,
 * favicon-32x32.png, apple-touch-icon.png
 */
import type { Metadata, MetadataRoute } from '@/lib/seo/nextTypes'
import { getSiteSeoConfig } from '@/lib/seo/siteSeoConfig'

export const BRANDING_FILES = {
  ogImage: 'og-image.jpg',
  maskable: 'maskable.png',
  logo192: 'logo192.png',
  logo256: 'logo256.png',
  logo384: 'logo384.png',
  logo512: 'logo512.png',
  favicon16: 'favicon-16x16.png',
  favicon32: 'favicon-32x32.png',
  appleTouchIcon: 'apple-touch-icon.png',
} as const

export function getSiteBrandingPath(siteSlug: string): string {
  return getSiteSeoConfig(siteSlug).brandingPath
}

export function getSiteBrandingAsset(siteSlug: string, fileName: string): string {
  const base = getSiteBrandingPath(siteSlug).replace(/\/$/, '')
  return `${base}/${fileName}`
}

export function getSiteOgImagePath(siteSlug: string): string {
  return getSiteBrandingAsset(siteSlug, BRANDING_FILES.ogImage)
}

export function getSiteManifestIcons(siteSlug: string): NonNullable<MetadataRoute.Manifest['icons']> {
  const asset = (file: string) => getSiteBrandingAsset(siteSlug, file)

  return [
    {
      src: asset(BRANDING_FILES.maskable),
      sizes: '625x625',
      type: 'image/png',
      purpose: 'maskable',
    },
    {
      src: asset(BRANDING_FILES.logo192),
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: asset(BRANDING_FILES.logo256),
      sizes: '256x256',
      type: 'image/png',
    },
    {
      src: asset(BRANDING_FILES.logo384),
      sizes: '384x384',
      type: 'image/png',
    },
    {
      src: asset(BRANDING_FILES.logo512),
      sizes: '512x512',
      type: 'image/png',
    },
  ]
}

export function getSiteLayoutIcons(siteSlug: string): Metadata['icons'] {
  return {
    icon: [
      {
        url: getSiteBrandingAsset(siteSlug, BRANDING_FILES.favicon16),
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: getSiteBrandingAsset(siteSlug, BRANDING_FILES.favicon32),
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: getSiteBrandingAsset(siteSlug, BRANDING_FILES.logo512),
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: getSiteBrandingAsset(siteSlug, BRANDING_FILES.appleTouchIcon),
  }
}
