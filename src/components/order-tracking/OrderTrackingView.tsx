/**
 * Affichage client de /commande/suivi/[token] : statut, créneau, compte à rebours.
 */
'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatPrice } from '@/lib/formatPrice'
import { formatCountdown, type PublicOrderTracking } from '@/lib/orderTracking'
import { cn } from '@/lib/utils'
import type { Site } from '@/payload-types'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

type Props = {
  site: Site
  token: string
  initialOrder: PublicOrderTracking
}

function statusBadgeClass(status: PublicOrderTracking['status']): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-900'
    case 'cancelled':
      return 'bg-red-100 text-red-900'
    default:
      return 'bg-amber-100 text-amber-900'
  }
}

function Countdown({ pickupAtMs }: { pickupAtMs: number }) {
  const [label, setLabel] = useState(() => formatCountdown(pickupAtMs - Date.now()))

  useEffect(() => {
    const tick = () => {
      setLabel(formatCountdown(pickupAtMs - Date.now()))
    }

    tick()
    const interval = window.setInterval(tick, 30_000)
    return () => window.clearInterval(interval)
  }, [pickupAtMs])

  return <p className="text-sm font-medium text-primary">{label}</p>
}

export function OrderTrackingView({ site, token, initialOrder }: Props) {
  const [order, setOrder] = useState(initialOrder)

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/track/${token}?siteId=${site.id}`)
      if (!response.ok) {
        return
      }

      const data = (await response.json()) as { order: PublicOrderTracking }
      setOrder(data.order)
    } catch {
      // Rafraîchissement silencieux
    }
  }, [site.id, token])

  useEffect(() => {
    if (order.status !== 'in_progress') {
      return
    }

    const interval = window.setInterval(() => {
      void refresh()
    }, 60_000)

    return () => window.clearInterval(interval)
  }, [order.status, refresh])

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:py-12">
      <div>
        <p className="text-sm text-neutral-600">{site.name}</p>
        <h1 className="text-3xl font-semibold tracking-tight">Suivi de commande</h1>
        <p className="mt-2 text-neutral-600">
          Commande {order.displayNumber} — {order.customerName}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-3">
            <span>{order.displayNumber}</span>
            <span
              className={cn(
                'rounded-full px-3 py-1 text-sm font-medium',
                statusBadgeClass(order.status),
              )}
            >
              {order.statusLabel}
            </span>
          </CardTitle>
          <CardDescription>{order.paymentStatusLabel}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {order.showPickupSlot && order.pickupSlotLabel ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Créneau de retrait</p>
              <p className="mt-1 text-base">{order.pickupSlotLabel}</p>
              {order.showCountdown && order.status === 'in_progress' && order.pickupAtMs ? (
                <div className="mt-2">
                  <Countdown pickupAtMs={order.pickupAtMs} />
                </div>
              ) : null}
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Articles</p>
            <ul className="list-none space-y-2 p-0 text-sm">
              {order.lines.map((line, index) => (
                <li key={`${line.name}-${index}`} className="flex justify-between gap-4">
                  <span>
                    {line.name} × {line.quantity}
                  </span>
                  <span className="menu-price">{formatPrice(line.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <p className="menu-price mt-3 text-right font-semibold">{formatPrice(order.total)}</p>
          </div>

          {order.status === 'in_progress' ? (
            <p className="text-sm text-muted-foreground">
              Cette page se met à jour automatiquement lorsque votre commande est prête.
            </p>
          ) : null}

          {order.status === 'completed' ? (
            <p className="text-sm text-green-800">
              Votre commande est prête. Présentez-vous au restaurant pour la récupérer.
            </p>
          ) : null}

          {order.status === 'cancelled' ? (
            <p className="text-sm text-red-800">
              Cette commande a été annulée. Contactez le restaurant si vous avez des questions.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/carte">
          <Button type="button" variant="outline">
            Retour à la carte
          </Button>
        </Link>
        <Button type="button" variant="ghost" onClick={() => void refresh()}>
          Actualiser
        </Button>
      </div>
    </div>
  )
}
