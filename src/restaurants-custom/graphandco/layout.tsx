/**
 * Shell graphandco : header/footer par défaut + thème click & collect.
 */
import { DefaultSiteFooter } from '@/components/layout/DefaultSiteFooter'
import { DefaultSiteHeader } from '@/components/layout/DefaultSiteHeader'
import type { Site } from '@/payload-types'
import { Outfit } from 'next/font/google'
import type { ReactNode } from 'react'
import './graphandco.css'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
})

type Props = {
  site: Site
  children: ReactNode
}

export default function GraphandcoLayout({ site, children }: Props) {
  return (
    <div className={`site-graphandco ${outfit.className} flex min-h-screen flex-col`}>
      <DefaultSiteHeader site={site} />
      <main className="w-full flex-1">{children}</main>
      <DefaultSiteFooter site={site} />
    </div>
  )
}
