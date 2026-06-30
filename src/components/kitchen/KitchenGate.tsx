/**
 * Garde d'authentification de l'écran cuisine (composant client).
 *
 * Rôle : afficher le bon écran selon la session Payload (cookie partagé avec /admin).
 *
 *   checking        → « Vérification de la session… »
 *   unauthenticated → KitchenLogin (POST /api/users/login)
 *   authenticated   → KitchenView (liste + actions sur les commandes)
 *
 * Au montage et après login, appelle GET /api/kitchen/session?siteId=…
 * (requireKitchenAccess côté serveur : admin ou editor avec le site assigné).
 *
 * loginAfterSubtitle : contenu optionnel sous le sous-titre du login (ex. bandeau démo graphandco).
 */
'use client'

import { KitchenLogin } from '@/components/kitchen/KitchenLogin'
import { KitchenView } from '@/components/kitchen/KitchenView'
import type { Site } from '@/payload-types'
import { type ReactNode, useCallback, useEffect, useState } from 'react'

type Props = {
  site: Site
  /** Inséré sous « Connectez-vous pour gérer les commandes de … » (écran login uniquement). */
  loginAfterSubtitle?: ReactNode
}

type AuthState = 'checking' | 'authenticated' | 'unauthenticated'

export function KitchenGate({ site, loginAfterSubtitle }: Props) {
  const [authState, setAuthState] = useState<AuthState>('checking')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const checkSession = useCallback(async () => {
    setAuthState('checking')

    try {
      const response = await fetch(`/api/kitchen/session?siteId=${site.id}`, {
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
      <KitchenLogin
        site={site}
        afterSubtitle={loginAfterSubtitle}
        onSuccess={() => void checkSession()}
      />
    )
  }

  return (
    <KitchenView
      site={site}
      userEmail={userEmail}
      onSessionExpired={() => {
        setAuthState('unauthenticated')
        setUserEmail(null)
      }}
    />
  )
}
