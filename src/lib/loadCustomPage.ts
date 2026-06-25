import type { ComponentType } from 'react'
import type { Site } from '@/payload-types'

type CustomSitePage = ComponentType<{ site: Site }>

type CustomPageLoader = () => Promise<{ default: CustomSitePage }>

const customPageLoaders: Record<string, Record<string, CustomPageLoader>> = {
  'lucelle-app': {
    carte: () => import('@/restaurants-custom/lucelle-app/carte/page'),
  },
}

export async function loadCustomPage(siteSlug: string, path: string): Promise<CustomSitePage | null> {
  const loader = customPageLoaders[siteSlug]?.[path]
  if (!loader) {
    return null
  }

  const module = await loader()
  return module.default
}

export function hasCustomPage(siteSlug: string, path: string): boolean {
  return Boolean(customPageLoaders[siteSlug]?.[path])
}
