/**
 * Menu burger responsive : liens de navigation desktop + panneau mobile.
 * Le slot `actions` accueille des éléments à droite (ex. badge panier).
 */
'use client'

import type { SiteNavLink } from '@/lib/siteNav'
import Link from 'next/link'
import { useEffect, useId, useState } from 'react'

type Props = {
  siteName: string
  links: SiteNavLink[]
  actions?: React.ReactNode
  logoClassName?: string
  navClassName?: string
  linkClassName?: string
  panelClassName?: string
  buttonClassName?: string
}

export function BurgerMenu({
  siteName,
  links,
  actions,
  logoClassName = '',
  navClassName = '',
  linkClassName = '',
  panelClassName = '',
  buttonClassName = '',
}: Props) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className={`text-xl font-semibold tracking-tight no-underline ${logoClassName}`}
          onClick={close}
        >
          {siteName}
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          <button
            type="button"
            className={`relative z-50 flex size-10 items-center justify-center rounded-md md:hidden ${buttonClassName}`}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? 'Fermer' : 'Menu'}</span>
            <span className="flex flex-col gap-1.5">
              <span
                className={`block h-0.5 w-5 bg-current transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`}
              />
              <span className={`block h-0.5 w-5 bg-current transition-opacity ${open ? 'opacity-0' : ''}`} />
              <span
                className={`block h-0.5 w-5 bg-current transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`}
              />
            </span>
          </button>

          <nav className={`hidden items-center gap-6 text-sm font-medium md:flex ${navClassName}`}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={`no-underline ${linkClassName}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {actions}
        </div>
      </div>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Fermer le menu"
          onClick={close}
        />
      ) : null}

      <nav
        id={panelId}
        className={`fixed top-0 right-0 z-40 flex h-full w-[min(100%,20rem)] flex-col gap-1 px-6 pt-24 shadow-2xl transition-transform md:hidden ${
          open ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        } ${panelClassName}`}
        aria-hidden={!open}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-3 text-lg no-underline ${linkClassName}`}
            onClick={close}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
