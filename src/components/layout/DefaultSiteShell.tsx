import type { Site } from '@/payload-types'
import type { ReactNode } from 'react'

type Props = {
  site: Site
  children: ReactNode
}

export function DefaultSiteShell({ site, children }: Props) {
  return (
    <>
      <header style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
        <strong>{site.name}</strong>
      </header>
      <main>{children}</main>
      <footer style={{ padding: '1rem', borderTop: '1px solid #eee', fontSize: '0.875rem' }}>
        © {site.name}
      </footer>
    </>
  )
}
