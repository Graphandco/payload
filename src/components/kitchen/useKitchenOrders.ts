/**
 * Données cuisine côté client : chargement, polling et mise à jour des statuts.
 *
 * Appelle /api/kitchen/orders avec credentials: include (cookie Payload).
 * Sur 401/403, déclenche onSessionExpired → KitchenGate repasse en écran login.
 */
'use client'

import { groupKitchenOrdersBySlot } from '@/lib/kitchen/groupKitchenOrdersBySlot'
import type { KitchenOrder, KitchenOrderAction, KitchenOrderGroup } from '@/lib/kitchen/kitchenOrderTypes'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

const POLL_INTERVAL_MS = 20_000

export function useKitchenOrders(siteId: number, onSessionExpired?: () => void) {
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
        const response = await fetch(`/api/kitchen/orders?siteId=${siteId}`, {
          cache: 'no-store',
          credentials: 'include',
        })
        const data = (await response.json()) as {
          orders?: KitchenOrder[]
          message?: string
        }

        if (response.status === 401 || response.status === 403) {
          onSessionExpired?.()
          return
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
    [onSessionExpired, siteId],
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

  const updateStatus = useCallback(
    async (orderId: number, status: KitchenOrderAction) => {
      setUpdatingOrderId(orderId)

      try {
        const response = await fetch(`/api/kitchen/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ siteId, status }),
        })

        const data = (await response.json()) as { message?: string }

        if (response.status === 401 || response.status === 403) {
          onSessionExpired?.()
          return
        }

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

        toast.success(status === 'completed' ? 'Commande confirmée' : 'Commande annulée')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Mise à jour impossible.'
        toast.error(message)
      } finally {
        setUpdatingOrderId(null)
      }
    },
    [onSessionExpired, siteId],
  )

  return {
    groups,
    isLoading,
    isRefreshing,
    updatingOrderId,
    error,
    fetchOrders,
    updateStatus,
  }
}
