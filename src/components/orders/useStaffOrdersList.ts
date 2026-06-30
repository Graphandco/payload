/**
 * Liste paginée des commandes pour /commandes.
 */
'use client'

import type { StaffOrdersListResult } from '@/lib/orders/staffOrderTypes'
import { useCallback, useEffect, useState } from 'react'

export function useStaffOrdersList(
  siteId: number,
  orderSearch: string,
  onSessionExpired?: () => void,
) {
  const [data, setData] = useState<StaffOrdersListResult | null>(null)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(
    async (targetPage: number, search: string) => {
      setIsLoading(true)

      try {
        const params = new URLSearchParams({
          siteId: String(siteId),
          page: String(targetPage),
        })

        const trimmedSearch = search.trim()
        if (trimmedSearch) {
          params.set('search', trimmedSearch)
        }

        const response = await fetch(`/api/orders/staff?${params.toString()}`, {
          credentials: 'include',
          cache: 'no-store',
        })

        const json = (await response.json()) as StaffOrdersListResult & { message?: string }

        if (response.status === 401 || response.status === 403) {
          onSessionExpired?.()
          return
        }

        if (!response.ok) {
          throw new Error(json.message ?? 'Impossible de charger les commandes.')
        }

        setData(json)
        setPage(targetPage)
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Impossible de charger les commandes.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    },
    [onSessionExpired, siteId],
  )

  useEffect(() => {
    void fetchOrders(1, orderSearch)
  }, [fetchOrders, orderSearch])

  return {
    data,
    page,
    isLoading,
    error,
    fetchOrders,
    setPage: (nextPage: number) => void fetchOrders(nextPage, orderSearch),
  }
}
