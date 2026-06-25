import type { ComponentType } from 'react'
import type { Site } from '@/payload-types'

type CustomHomePage = ComponentType<{ site: Site }>

const customHomeLoaders: Record<string, () => Promise<{ default: CustomHomePage }>> = {
  'lucelle-app': () => import('@/restaurants-custom/lucelle-app/page'),
}

export async function loadCustomHome(siteSlug: string): Promise<CustomHomePage | null> {
  const loader = customHomeLoaders[siteSlug]
  if (!loader) {
    return null
  }

  const module = await loader()
  return module.default
}

export function hasCustomHome(siteSlug: string): boolean {
  return siteSlug in customHomeLoaders
}
