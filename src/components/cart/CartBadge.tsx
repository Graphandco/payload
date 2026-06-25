'use client'

import { useCartItemCount } from '@/stores/cartStore'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Props = {
  siteId: number
  className?: string
}

export function CartBadge({ siteId, className = '' }: Props) {
  const count = useCartItemCount(siteId)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayCount = mounted ? count : 0

  return (
    <Link
      href="/panier"
      className={`cart-badge relative inline-flex items-center no-underline ${className}`}
      aria-label={displayCount > 0 ? `Voir le panier (${displayCount} article${displayCount > 1 ? 's' : ''})` : 'Voir le panier'}
    >
      <ShoppingCart className="size-5" aria-hidden />
      {displayCount > 0 ? (
        <span className="cart-badge-count absolute -top-2 -right-2.5 flex size-5 items-center justify-center rounded-full text-xs font-semibold">
          {displayCount > 99 ? '99+' : displayCount}
        </span>
      ) : null}
    </Link>
  )
}
