/**
 * Formulaire de connexion cuisine.
 *
 * Utilise l'auth Payload (mêmes identifiants que le backoffice /admin) :
 *   1. POST /api/users/login → cookie de session
 *   2. GET /api/kitchen/session → vérifie l'accès au site (editor assigné ou admin)
 *
 * afterSubtitle : slot optionnel (bandeau démo graphandco, etc.).
 */
'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Site } from '@/payload-types'
import { type FormEvent, type ReactNode, useState } from 'react'

type Props = {
  site: Site
  afterSubtitle?: ReactNode
  onSuccess: () => void
}

export function KitchenLogin({ site, afterSubtitle, onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = (await response.json()) as { message?: string; errors?: { message: string }[] }

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message ?? data.message ?? 'Identifiants incorrects.')
      }

      const sessionResponse = await fetch(`/api/kitchen/session?siteId=${site.id}`, {
        credentials: 'include',
        cache: 'no-store',
      })

      if (!sessionResponse.ok) {
        const sessionData = (await sessionResponse.json()) as { message?: string }
        throw new Error(
          sessionData.message ?? 'Compte sans accès à la cuisine de ce restaurant.',
        )
      }

      onSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connexion impossible.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Cuisine</h1>
        <p className="text-sm text-muted-foreground">
          Connectez-vous pour gérer les commandes de {site.name}.
        </p>
      </div>

      {afterSubtitle ? <div className="mt-4">{afterSubtitle}</div> : null}

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="kitchen-email">E-mail</Label>
          <Input
            id="kitchen-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="kitchen-password">Mot de passe</Label>
          <Input
            id="kitchen-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </div>
  )
}
