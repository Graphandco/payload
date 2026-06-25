/**
 * Shell custom Lucelle : header, footer et thème propre (lucelle.css).
 * Enregistré dans loadSiteShell pour le slug lucelle-app.
 */
import type { Site } from '@/payload-types'
import type { ReactNode } from 'react'
import { LucelleFooter } from './components/Footer'
import { LucelleHeader } from './components/Header'
import './lucelle.css'

type Props = {
  site: Site
  children: ReactNode
}

export default function LucelleLayout({ site, children }: Props) {
  return (
    <div className="site-lucelle flex min-h-screen flex-col">
      <LucelleHeader site={site} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
      <LucelleFooter site={site} />
    </div>
  )
}
