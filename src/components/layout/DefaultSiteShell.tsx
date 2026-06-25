/**
 * Shell par défaut pour les sites sans layout custom.
 * Fournit header, footer et thème italien (default-shell.css).
 */
import { DefaultSiteFooter } from '@/components/layout/DefaultSiteFooter'
import { DefaultSiteHeader } from '@/components/layout/DefaultSiteHeader'
import type { Site } from '@/payload-types'
import type { ReactNode } from 'react'
import '@/styles/default-shell.css'

type Props = {
  site: Site
  children: ReactNode
}

export function DefaultSiteShell({ site, children }: Props) {
  return (
    <div className="site-default flex min-h-screen flex-col">
      <DefaultSiteHeader site={site} />
      <main className="default-main mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        {children}
      </main>
      <DefaultSiteFooter site={site} />
    </div>
  )
}
