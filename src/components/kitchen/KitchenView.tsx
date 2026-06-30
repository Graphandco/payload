/**
 * Écran cuisine connecté : commandes en cours groupées par créneau de retrait.
 *
 * Affiché par KitchenGate une fois la session validée.
 * Données : useKitchenOrders → GET/PATCH /api/kitchen/orders (credentials: include).
 */
'use client'

import { KitchenConfirmDialog } from '@/components/kitchen/KitchenConfirmDialog'
import { KitchenHeader } from '@/components/kitchen/KitchenHeader'
import { KitchenSlotTable } from '@/components/kitchen/KitchenSlotTable'
import { useKitchenOrders } from '@/components/kitchen/useKitchenOrders'
import type {
  KitchenOrder,
  KitchenOrderAction,
  KitchenPendingAction,
} from '@/lib/kitchen/kitchenOrderTypes'
import type { Site } from '@/payload-types'
import { useState } from 'react'

type Props = {
  site: Site
  userEmail?: string | null
  onSessionExpired: () => void
}

export function KitchenView({ site, userEmail, onSessionExpired }: Props) {
  const { groups, isLoading, isRefreshing, updatingOrderId, error, fetchOrders, updateStatus } =
    useKitchenOrders(site.id, onSessionExpired)

  const [pendingAction, setPendingAction] = useState<KitchenPendingAction | null>(null)

  function handleRequestAction(order: KitchenOrder, status: KitchenOrderAction) {
    setPendingAction({ order, status })
  }

  async function handleConfirmAction() {
    if (!pendingAction) {
      return
    }

    const { order, status } = pendingAction
    await updateStatus(order.id, status)
    setPendingAction(null)
  }

  async function handleLogout() {
    await fetch('/api/users/logout', {
      method: 'POST',
      credentials: 'include',
    })
    onSessionExpired()
  }

  return (
    <div className="min-h-[60vh]">
      <KitchenHeader
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        userEmail={userEmail}
        onRefresh={() => void fetchOrders('refresh')}
        onLogout={() => void handleLogout()}
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
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
          groups.map((group) => (
            <KitchenSlotTable
              key={group.pickupSlotValue}
              group={group}
              updatingOrderId={updatingOrderId}
              onRequestAction={handleRequestAction}
            />
          ))
        )}
      </div>

      <KitchenConfirmDialog
        pendingAction={pendingAction}
        isSubmitting={pendingAction !== null && updatingOrderId === pendingAction.order.id}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null)
          }
        }}
        onConfirm={() => void handleConfirmAction()}
      />
    </div>
  )
}
