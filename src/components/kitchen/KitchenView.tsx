/**
 * Écran cuisine : commandes en cours groupées par créneau, rafraîchissement auto.
 */
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { groupKitchenOrdersBySlot } from '@/lib/kitchen/groupKitchenOrdersBySlot'
import type { KitchenOrder, KitchenOrderGroup } from '@/lib/kitchen/kitchenOrderTypes'
import { formatPrice } from '@/lib/formatPrice'
import type { Site } from '@/payload-types'
import { RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

type Props = {
  site: Site
}

const POLL_INTERVAL_MS = 20_000

const PAYMENT_LABELS: Record<KitchenOrder['paymentStatus'], string> = {
  pending: 'Paiement en attente',
  paid: 'Payée',
  failed: 'Paiement échoué',
  refunded: 'Remboursée',
}

function OrderCard({
  order,
  isUpdating,
  onComplete,
  onCancel,
}: {
  order: KitchenOrder
  isUpdating: boolean
  onComplete: (orderId: number) => void
  onCancel: (orderId: number) => void
}) {
  return (
    <Card size="sm" className="border-border/80">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3 text-lg">
          <span>{order.displayNumber}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {PAYMENT_LABELS[order.paymentStatus]}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          <p className="font-medium">{order.customerName}</p>
          <p className="text-muted-foreground">{order.customerPhone}</p>
        </div>
        <ul className="list-none space-y-1 p-0 text-sm">
          {order.lines.map((line, index) => (
            <li key={`${order.id}-${line.name}-${index}`} className="flex justify-between gap-3">
              <span>
                {line.quantity}× {line.name}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-right text-sm font-semibold">{formatPrice(order.total)}</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          type="button"
          className="flex-1"
          disabled={isUpdating}
          onClick={() => onComplete(order.id)}
        >
          Terminée
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={isUpdating}
          onClick={() => onCancel(order.id)}
        >
          Annuler
        </Button>
      </CardFooter>
    </Card>
  )
}

function SlotSection({ group, children }: { group: KitchenOrderGroup; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
        <h2 className="text-lg font-semibold">{group.pickupSlotLabel}</h2>
        <span className="text-sm text-muted-foreground">
          {group.orders.length} commande{group.orders.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  )
}

export function KitchenView({ site }: Props) {
  const [groups, setGroups] = useState<KitchenOrderGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'initial') {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }

      try {
        const response = await fetch(`/api/kitchen/orders?siteId=${site.id}`, {
          cache: 'no-store',
        })
        const data = (await response.json()) as {
          orders?: KitchenOrder[]
          message?: string
        }

        if (!response.ok) {
          throw new Error(data.message ?? 'Impossible de charger les commandes.')
        }

        setGroups(groupKitchenOrdersBySlot(data.orders ?? []))
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Impossible de charger les commandes.'
        setError(message)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [site.id],
  )

  useEffect(() => {
    void fetchOrders('initial')
  }, [fetchOrders])

  useEffect(() => {
    const interval = window.setInterval(() => {
      void fetchOrders('refresh')
    }, POLL_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [fetchOrders])

  async function updateStatus(orderId: number, status: 'completed' | 'cancelled') {
    setUpdatingOrderId(orderId)

    try {
      const response = await fetch(`/api/kitchen/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: site.id, status }),
      })

      const data = (await response.json()) as { message?: string; order?: KitchenOrder }

      if (!response.ok) {
        throw new Error(data.message ?? 'Mise à jour impossible.')
      }

      setGroups((current) =>
        current
          .map((group) => ({
            ...group,
            orders: group.orders.filter((order) => order.id !== orderId),
          }))
          .filter((group) => group.orders.length > 0),
      )

      toast.success(status === 'completed' ? 'Commande terminée' : 'Commande annulée')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Mise à jour impossible.'
      toast.error(message)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{site.name}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Cuisine</h1>
          <p className="mt-1 text-sm text-muted-foreground">Commandes en cours à préparer</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading || isRefreshing}
          onClick={() => void fetchOrders('refresh')}
        >
          <RefreshCw className={isRefreshing ? 'animate-spin' : ''} />
          Actualiser
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement des commandes…</p>
      ) : error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : groups.length === 0 ? (
        <p className="rounded-lg border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
          Aucune commande en cours pour le moment.
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <SlotSection key={group.pickupSlotValue} group={group}>
              {group.orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isUpdating={updatingOrderId === order.id}
                  onComplete={(orderId) => void updateStatus(orderId, 'completed')}
                  onCancel={(orderId) => void updateStatus(orderId, 'cancelled')}
                />
              ))}
            </SlotSection>
          ))}
        </div>
      )}
    </div>
  )
}
