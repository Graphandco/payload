/**
 * Menu burger responsive : liens desktop + panneau mobile animé avec GSAP.
 * Overlay/panneau portés sur body (échappe au backdrop-filter du header).
 */
'use client'

import type { SiteNavLink } from '@/lib/siteNav'
import gsap from 'gsap'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  siteName: string
  logoUrl?: string | null
  links: SiteNavLink[]
  actions?: React.ReactNode
  logoClassName?: string
  navClassName?: string
  linkClassName?: string
  panelClassName?: string
  buttonClassName?: string
}

const MD_BREAKPOINT = 768

export function BurgerMenu({
  siteName,
  logoUrl,
  links,
  actions,
  logoClassName = '',
  navClassName = '',
  linkClassName = '',
  panelClassName = '',
  buttonClassName = '',
}: Props) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const panelId = useId()
  const overlayRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const prevOpenRef = useRef(false)
  const openRef = useRef(open)

  openRef.current = open

  useEffect(() => {
    setMounted(true)
  }, [])

  const setClosedState = () => {
    gsap.set(overlayRef.current, { autoAlpha: 0, pointerEvents: 'none' })
    gsap.set(panelRef.current, {
      xPercent: 100,
      autoAlpha: 0,
      pointerEvents: 'none',
    })

    if (linksRef.current) {
      gsap.set(gsap.utils.toArray<HTMLElement>('.burger-nav-link', linksRef.current), {
        x: 24,
        autoAlpha: 0,
      })
    }
  }

  const syncPanelTheme = () => {
    const siteRoot = document.querySelector('.site-default, .site-graphandco')
    const panel = panelRef.current

    if (!siteRoot || !panel) {
      return
    }

    const styles = getComputedStyle(siteRoot)
    const isGraphandco = siteRoot.classList.contains('site-graphandco')

    panel.style.setProperty(
      '--burger-panel-bg',
      isGraphandco
        ? styles.getPropertyValue('--graphandco-surface').trim() || '#f4fdfa'
        : styles.getPropertyValue('--italy-cream').trim() || '#faf7f2',
    )
    panel.style.setProperty(
      '--burger-panel-border',
      isGraphandco
        ? styles.getPropertyValue('--graphandco-border').trim() || '#c5e8df'
        : styles.getPropertyValue('--italy-stone').trim() || '#e8e2d9',
    )
  }

  useLayoutEffect(() => {
    if (!mounted) {
      return
    }

    syncPanelTheme()
    setClosedState()
  }, [mounted])

  useEffect(() => {
    if (!mounted || !overlayRef.current || !panelRef.current) {
      return
    }

    if (prevOpenRef.current === open) {
      return
    }

    prevOpenRef.current = open
    timelineRef.current?.kill()

    const linkEls = linksRef.current
      ? gsap.utils.toArray<HTMLElement>('.burger-nav-link', linksRef.current)
      : []

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => {
        if (!openRef.current) {
          gsap.set(panelRef.current, { pointerEvents: 'none' })
          gsap.set(overlayRef.current, { pointerEvents: 'none' })
        }
      },
    })

    if (open) {
      gsap.set(panelRef.current, { pointerEvents: 'auto' })
      gsap.set(overlayRef.current, { pointerEvents: 'auto' })

      tl.to(overlayRef.current, { autoAlpha: 1, duration: 0.25 })
        .to(
          panelRef.current,
          { xPercent: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out' },
          '<0.05',
        )
        .fromTo(
          linkEls,
          { x: 24, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, stagger: 0.08, duration: 0.35 },
          '-=0.15',
        )
    } else {
      tl.to(linkEls, {
        x: 24,
        autoAlpha: 0,
        stagger: { each: 0.05, from: 'end' },
        duration: 0.2,
        ease: 'power2.in',
      })
        .to(
          panelRef.current,
          { xPercent: 100, autoAlpha: 0, duration: 0.35, ease: 'power3.in' },
          '-=0.05',
        )
        .to(overlayRef.current, { autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, '<0.1')
    }

    timelineRef.current = tl

    return () => {
      tl.kill()
    }
  }, [open, mounted])

  useEffect(() => {
    document.body.classList.toggle('burger-menu-open', open)

    return () => {
      document.body.classList.remove('burger-menu-open')
    }
  }, [open])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= MD_BREAKPOINT && openRef.current) {
        timelineRef.current?.kill()
        setOpen(false)
        setClosedState()
        prevOpenRef.current = false
      }
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const close = () => setOpen(false)

  const mobileLayer =
    mounted &&
    createPortal(
      <>
        <button
          ref={overlayRef}
          type="button"
          className="burger-menu-overlay fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Fermer le menu"
          tabIndex={open ? 0 : -1}
          onClick={close}
        />

        <nav
          id={panelId}
          ref={panelRef}
          className={`burger-menu-panel fixed inset-y-0 right-0 z-50 flex w-[min(100vw,20rem)] flex-col overflow-hidden overscroll-contain shadow-2xl md:hidden ${panelClassName}`}
          aria-hidden={!open}
        >
          <div
            ref={linksRef}
            className="flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-6 pt-24 pb-8"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`burger-nav-link rounded-md px-3 py-3 text-lg no-underline ${linkClassName}`}
                onClick={close}
                tabIndex={open ? 0 : -1}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </>,
      document.body,
    )

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className={`inline-flex items-center gap-3 text-xl font-semibold tracking-tight no-underline ${logoClassName}`}
          onClick={close}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              aria-hidden
              className="h-8 w-auto max-w-30 shrink-0 object-contain"
            />
          ) : null}
          <span>{siteName}</span>
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          <button
            type="button"
            className={`burger-menu-toggle relative flex size-10 shrink-0 items-center justify-center rounded-md md:hidden ${buttonClassName}`}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
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

      {mobileLayer}
    </>
  )
}
