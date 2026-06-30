/**
 * Bandeau identifiants démo (site graphandco uniquement).
 *
 * Injecté dans KitchenLogin via KitchenGate.loginAfterSubtitle
 * (sous « Connectez-vous pour gérer les commandes de … »).
 */
import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

export function KitchenDemoBanner({ className }: Props) {
  return (
    <div
      role="note"
      className={cn(
        'rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-950',
        className,
      )}
    >
      <p className="font-medium">Mode démo</p>
      <p className="mt-1">
        Utilisateur&nbsp;: <span className="font-medium">demo@demo.com</span>
      </p>
      <p>
        Mot de passe&nbsp;: <span className="font-medium">demo</span>
      </p>
    </div>
  )
}
