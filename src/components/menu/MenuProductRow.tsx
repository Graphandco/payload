'use client'

import { formatPrice } from '@/lib/formatPrice'
import { useCartStore } from '@/stores/cartStore'
import type { Media, Product } from '@/payload-types'
import Image from 'next/image'

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
        <button
          type="button"
          className="cart-add-btn shrink-0 rounded-md px-4 py-2 text-sm font-medium"
          onClick={() => addItem(siteId, { id: product.id, name: product.name, price: product.price })}
        >
          Ajouter
        </button>
      </div>
    </li>
  )
}
