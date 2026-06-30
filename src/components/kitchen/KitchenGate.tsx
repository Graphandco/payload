/**
 * Garde d'authentification écran cuisine (délègue à StaffGate).
 */
'use client'

import { KitchenView } from '@/components/kitchen/KitchenView'
import { StaffGate } from '@/components/staff/StaffGate'
import type { Site } from '@/payload-types'
import type { ReactNode } from 'react'

type Props = {
  site: Site
  loginAfterSubtitle?: ReactNode
}

export function KitchenGate({ site, loginAfterSubtitle }: Props) {
  return (
    <StaffGate
      site={site}
      pageTitle="Cuisine"
      loginDescription={`Connectez-vous pour accéder à l'écran cuisine de ${site.name}.`}
      loginAfterSubtitle={loginAfterSubtitle}
    >
      {({ userEmail, onSessionExpired }) => (
        <KitchenView site={site} userEmail={userEmail} onSessionExpired={onSessionExpired} />
      )}
    </StaffGate>
  )
}
