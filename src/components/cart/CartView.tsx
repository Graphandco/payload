/**
 * Panier client : liste des articles, quantités, total et actions (vider, retirer).
 * Lit et met à jour le store Zustand persisté en localStorage, isolé par siteId.
 */
'use client'

import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/formatPrice'
import { useCartLines, useCartStore, useCartTotal } from '@/stores/cartStore'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Props = {
  siteId: number
}

export function CartView({ siteId }: Props) {
  const lines = useCartLines(siteId)
  const total = useCartTotal(siteId)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const clearSite = useCartStore((state) => state.clearSite)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Panier</h1>
        <p className="text-neutral-600">Chargement du panier…</p>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Panier</h1>
        <p className="text-neutral-600">Votre panier est vide.</p>
        <Link href="/carte" className="cart-link inline-block font-medium no-underline">
          Voir la carte
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Panier</h1>
        <Button type="button" variant="ghost" size="sm" onClick={() => clearSite(siteId)}>
          Vider le panier
        </Button>
      </div>

      <ul className="list-none space-y-0 p-0">
        {lines.map((line) => (
          <li key={line.productId} className="cart-line flex flex-wrap items-center justify-between gap-4 border-b py-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{line.name}</p>
              <p className="text-sm text-neutral-600">{formatPrice(line.price)} / unité</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-md border border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Diminuer la quantité"
                  onClick={() => setQuantity(siteId, line.productId, line.quantity - 1)}
                >
                  −
                </Button>
                <span className="min-w-8 text-center text-sm font-medium">{line.quantity}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Augmenter la quantité"
                  onClick={() => setQuantity(siteId, line.productId, line.quantity + 1)}
                >
                  +
                </Button>
              </div>
              <strong className="menu-price min-w-20 text-right">{formatPrice(line.price * line.quantity)}</strong>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="text-muted-foreground"
                onClick={() => removeItem(siteId, line.productId)}
              >
                Retirer
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
        <p className="text-lg font-semibold">Total</p>
        <p className="text-xl font-semibold menu-price">{formatPrice(total)}</p>
      </div>

      <p className="text-sm text-neutral-600">
        Le paiement en ligne sera disponible prochainement.
      </p>

      <Link href="/carte" className="cart-link inline-block font-medium no-underline">
        Continuer mes achats
      </Link>
    </div>
  )
}
