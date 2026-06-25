import type { ComponentType, ReactNode } from 'react'
import type { Site } from '@/payload-types'

export type SiteShell = ComponentType<{ site: Site; children: ReactNode }>

type SiteShellLoader = () => Promise<{ default: SiteShell }>

const siteShellLoaders: Record<string, SiteShellLoader> = {
  'lucelle-app': () => import('@/restaurants-custom/lucelle-app/layout'),
}

export async function loadSiteShell(siteSlug: string): Promise<SiteShell | null> {
  const loader = siteShellLoaders[siteSlug]
  if (!loader) {
    return null
  }

  const module = await loader()
  return module.default
}

export function hasSiteShell(siteSlug: string): boolean {
  return siteSlug in siteShellLoaders
}
