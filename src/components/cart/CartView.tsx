/**
 * Panier client : liste des articles, quantités, total et actions (vider, retirer).
 * Lit et met à jour le store Zustand persisté en localStorage, isolé par siteId.
 */
'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { QuantityInput } from '@/components/ui/quantity-input'
import { formatPrice } from '@/lib/formatPrice'
import { useCartLines, useCartStore, useCartTotal } from '@/stores/cartStore'
import { CircleMinus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

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

  const handleRemoveItem = (productId: number, name: string) => {
    removeItem(siteId, productId)
    toast.success(`${name} retiré du panier`)
  }

  const handleClearCart = () => {
    clearSite(siteId)
    toast.success('Panier vidé')
  }

  if (!mounted) {
    return (
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Panier</h1>
        <p className="text-neutral-600">Chargement du panier…</p>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="space-y-4 mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <h1 className="text-4xl font-semibold tracking-tight">Panier</h1>
        <p className="text-neutral-600">Votre panier est vide.</p>
        <Link href="/carte" className="cart-link inline-block font-medium no-underline">
          Voir la carte
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Panier</h1>
        <AlertDialog>
          <AlertDialogTrigger render={<Button type="button" variant="ghost" size="sm" />}>
            Vider le panier
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Vider le panier ?</AlertDialogTitle>
              <AlertDialogDescription>
                Tous les articles seront retirés. Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleClearCart}>
                Vider le panier
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <ul className="list-none space-y-0 p-0">
        {lines.map((line) => (
          <li
            key={line.productId}
            className="cart-line flex flex-wrap items-center justify-between gap-4 not-last:border-b py-4"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium">{line.name}</p>
              <p className="text-sm text-neutral-600">{formatPrice(line.price)} / unité</p>
            </div>

            <div className="flex items-center gap-3">
              <QuantityInput
                value={line.quantity}
                aria-label={`Quantité de ${line.name}`}
                onChange={(quantity) => setQuantity(siteId, line.productId, quantity)}
              />
              <strong className="menu-price min-w-20 text-right">
                {formatPrice(line.price * line.quantity)}
              </strong>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="text-muted-foreground"
                aria-label={`Retirer ${line.name} du panier`}
                onClick={() => handleRemoveItem(line.productId, line.name)}
              >
                <CircleMinus className="size-4 text-destructive" />
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
