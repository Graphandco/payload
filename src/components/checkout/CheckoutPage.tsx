/**
 * Point d'entrée serveur de /commande : passe le site au composant client CheckoutView.
 */
import { CheckoutView } from '@/components/checkout/CheckoutView'
import type { Site } from '@/payload-types'

export const CHECKOUT_PAGE_SLUG = 'commande'

type Props = {
  site: Site
}

export function CheckoutPage({ site }: Props) {
  return <CheckoutView site={site} />
}

export function isCheckoutPath(path: string): boolean {
  return path === CHECKOUT_PAGE_SLUG
}
