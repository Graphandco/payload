/**
 * Garde d'authentification staff partagée (cuisine, commandes…).
 */
'use client'

import { StaffLogin } from '@/components/staff/StaffLogin'
import type { Site } from '@/payload-types'
import { type ReactNode, useCallback, useEffect, useState } from 'react'

type Props = {
  site: Site
  pageTitle: string
  loginDescription?: string
  loginAfterSubtitle?: ReactNode
  children: (context: { userEmail: string | null; onSessionExpired: () => void }) => ReactNode
}

type AuthState = 'checking' | 'authenticated' | 'unauthenticated'

export function StaffGate({
  site,
  pageTitle,
  loginDescription,
  loginAfterSubtitle,
  children,
}: Props) {
  const [authState, setAuthState] = useState<AuthState>('checking')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const checkSession = useCallback(async () => {
    setAuthState('checking')

    try {
      const response = await fetch(`/api/staff/session?siteId=${site.id}`, {
        credentials: 'include',
        cache: 'no-store',
      })

      if (!response.ok) {
        setAuthState('unauthenticated')
        setUserEmail(null)
        return
      }

      const data = (await response.json()) as { email?: string }
      setUserEmail(data.email ?? null)
      setAuthState('authenticated')
    } catch {
      setAuthState('unauthenticated')
      setUserEmail(null)
    }
  }, [site.id])

  useEffect(() => {
    void checkSession()
  }, [checkSession])

  if (authState === 'checking') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Vérification de la session…</p>
      </div>
    )
  }

  if (authState === 'unauthenticated') {
    return (
      <StaffLogin
        site={site}
        pageTitle={pageTitle}
        loginDescription={loginDescription}
        afterSubtitle={loginAfterSubtitle}
        onSuccess={() => void checkSession()}
      />
    )
  }

  return (
    <>
      {children({
        userEmail,
        onSessionExpired: () => {
          setAuthState('unauthenticated')
          setUserEmail(null)
        },
      })}
    </>
  )
}
