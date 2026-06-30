/**
 * Écran commandes connecté : tableau + export factures.
 */
'use client'

import { OrdersExportPanel } from '@/components/orders/OrdersExportPanel'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { useStaffOrdersList } from '@/components/orders/useStaffOrdersList'
import { Button } from '@/components/ui/button'
import type { Site } from '@/payload-types'
import { useState } from 'react'

type Props = {
  site: Site
  userEmail?: string | null
  onSessionExpired: () => void
}

export function OrdersView({ site, userEmail, onSessionExpired }: Props) {
  const [orderSearch, setOrderSearch] = useState('')
  const { data, page, isLoading, error, setPage } = useStaffOrdersList(
    site.id,
    orderSearch,
    onSessionExpired,
  )

  async function handleLogout() {
    await fetch('/api/users/logout', {
      method: 'POST',
      credentials: 'include',
    })
    onSessionExpired()
  }

  return (
    <div className="min-h-[60vh]">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Commandes</h1>
            {userEmail ? <p className="mt-1 text-sm text-muted-foreground">{userEmail}</p> : null}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => void handleLogout()}>
            Déconnexion
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <OrdersExportPanel
          site={site}
          orderSearch={orderSearch}
          onOrderSearchChange={setOrderSearch}
          onSessionExpired={onSessionExpired}
        />

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement des commandes…</p>
        ) : error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : !data || data.orders.length === 0 ? (
          <p className="rounded-lg border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            {orderSearch.trim()
              ? 'Aucune commande ne correspond à cette recherche.'
              : 'Aucune commande pour le moment.'}
          </p>
        ) : (
          <>
            <OrdersTable
              siteId={site.id}
              orders={data.orders}
              onSessionExpired={onSessionExpired}
            />

            {data.totalPages > 1 ? (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Page {data.page} sur {data.totalPages} — {data.totalDocs} commande
                  {data.totalDocs > 1 ? 's' : ''}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || isLoading}
                    onClick={() => setPage(page - 1)}
                  >
                    Précédent
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= data.totalPages || isLoading}
                    onClick={() => setPage(page + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
