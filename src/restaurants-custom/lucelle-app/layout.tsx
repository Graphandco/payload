import type { Site } from '@/payload-types'
import type { ReactNode } from 'react'
import { LucelleFooter } from './components/Footer'
import { LucelleHeader } from './components/Header'

type Props = {
  site: Site
  children: ReactNode
}

export default function LucelleLayout({ site, children }: Props) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LucelleHeader site={site} />
      <main style={{ flex: 1, maxWidth: '48rem', width: '100%', margin: '0 auto', padding: '2rem 1rem' }}>
        {children}
      </main>
      <LucelleFooter site={site} />
    </div>
  )
}
