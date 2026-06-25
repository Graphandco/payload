/**
 * Ligne produit sur la carte (client) : image, prix et bouton « Ajouter »
 * qui alimente le store Zustand du site courant.
 */
'use client'

import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/formatPrice'
import { useCartStore } from '@/stores/cartStore'
import type { Media, Product } from '@/payload-types'
import Image from 'next/image'
import { toast } from 'sonner'

type Props = {
  siteId: number
  product: Product
}

function resolveMedia(media: number | Media | null | undefined): Media | null {
  return typeof media === 'object' && media !== null ? media : null
}

export function MenuProductRow({ siteId, product }: Props) {
  const addItem = useCartStore((state) => state.addItem)
  const image = resolveMedia(product.featuredImage)

  const handleAdd = () => {
    addItem(siteId, { id: product.id, name: product.name, price: product.price })
    toast.success(`${product.name} ajouté au panier`)
  }

  return (
    <li className="menu-item flex items-center gap-4 border-b py-3">
      {image?.url ? (
        <Image
          src={image.url}
          alt={image.alt ?? product.name}
          width={56}
          height={56}
          className="size-14 shrink-0 rounded object-cover"
        />
      ) : null}
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center justify-between gap-4">
          <span className="font-medium">{product.name}</span>
          <strong className="menu-price shrink-0">{formatPrice(product.price)}</strong>
        </div>
        <Button
          type="button"
          size="sm"
          className="shrink-0"
          onClick={handleAdd}
        >
          Ajouter
        </Button>
      </div>
    </li>
  )
}
