/**
 * Garde d'authentification page /commandes.
 */
'use client'

import { OrdersView } from '@/components/orders/OrdersView'
import { StaffGate } from '@/components/staff/StaffGate'
import type { Site } from '@/payload-types'

type Props = {
  site: Site
}

export function OrdersGate({ site }: Props) {
  return (
    <StaffGate site={site} pageTitle="Commandes">
      {({ userEmail, onSessionExpired }) => (
        <OrdersView site={site} userEmail={userEmail} onSessionExpired={onSessionExpired} />
      )}
    </StaffGate>
  )
}
