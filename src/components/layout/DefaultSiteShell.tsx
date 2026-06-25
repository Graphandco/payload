import type { Site } from '@/payload-types'
import type { ReactNode } from 'react'

type Props = {
  site: Site
  children: ReactNode
}

export function DefaultSiteShell({ site, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-neutral-200 px-4 py-4">
        <strong className="text-lg">{site.name}</strong>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-neutral-200 px-4 py-4 text-sm text-neutral-600">
        © {site.name}
      </footer>
    </div>
  )
}
