/**
 * Point d'entrée serveur de /commandes : auth staff + liste + factures PDF.
 */
import { OrdersGate } from '@/components/orders/OrdersGate'
import type { Site } from '@/payload-types'

export const ORDERS_PAGE_SLUG = 'commandes'

type Props = {
  site: Site
}

export function OrdersPage({ site }: Props) {
  return <OrdersGate site={site} />
}

export function isOrdersPath(path: string): boolean {
  return path === ORDERS_PAGE_SLUG
}
