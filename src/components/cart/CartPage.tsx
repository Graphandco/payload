/**
 * Point d'entrée serveur de /panier : passe le site au composant client CartView.
 */
import { CartView } from '@/components/cart/CartView'
import type { Site } from '@/payload-types'

export const CART_PAGE_SLUG = 'panier'

type Props = {
  site: Site
}

export function CartPage({ site }: Props) {
  return <CartView site={site} />
}

export function isCartPath(path: string): boolean {
  return path === CART_PAGE_SLUG
}
