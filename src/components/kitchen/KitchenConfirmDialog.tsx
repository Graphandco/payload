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
} from '@/components/ui/alert-dialog'
import type { KitchenPendingAction } from '@/lib/kitchen/kitchenOrderTypes'

type Props = {
  pendingAction: KitchenPendingAction | null
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function KitchenConfirmDialog({
  pendingAction,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: Props) {
  const isCancel = pendingAction?.status === 'cancelled'

  return (
    <AlertDialog open={pendingAction !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default" className="max-w-md sm:max-w-md">
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle>
            {isCancel ? 'Annuler la commande ?' : 'Confirmer la commande ?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {pendingAction ? (
              <>
                Commande <strong>{pendingAction.order.displayNumber}</strong> —{' '}
                {pendingAction.order.customerName}.{' '}
                {isCancel
                  ? 'Cette action est irréversible.'
                  : 'La commande sera marquée comme terminée et retirée de la liste.'}
              </>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Retour</AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            className={
              isCancel
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
          >
            {isSubmitting ? 'En cours…' : isCancel ? 'Annuler la commande' : 'Confirmer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
