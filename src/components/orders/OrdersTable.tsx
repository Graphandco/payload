'use client'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { StaffOrderListItem } from '@/lib/orders/staffOrderTypes'
import { FileDown } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  siteId: number
  orders: StaffOrderListItem[]
  onSessionExpired?: () => void
}

function formatOrderDate(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(new Date(isoDate))
}

export function OrdersTable({ siteId, orders, onSessionExpired }: Props) {
  async function handleDownload(order: StaffOrderListItem) {
    if (!order.canDownloadInvoice) {
      toast.error('Facture disponible uniquement pour les commandes payées.')
      return
    }

    try {
      const response = await fetch(
        `/api/orders/staff/${order.id}/invoice?siteId=${siteId}`,
        { credentials: 'include' },
      )

      if (response.status === 401 || response.status === 403) {
        onSessionExpired?.()
        return
      }

      if (!response.ok) {
        const data = (await response.json()) as { message?: string }
        throw new Error(data.message ?? 'Téléchargement impossible.')
      }

      const blob = await response.blob()
      const disposition = response.headers.get('Content-Disposition')
      const filenameMatch = disposition?.match(/filename="(.+)"/)
      const filename = filenameMatch?.[1] ?? `facture-${order.displayNumber.replace('#', '')}.pdf`

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Téléchargement impossible.'
      toast.error(message)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Commande</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Montant</TableHead>
          <TableHead className="w-12 text-center">PDF</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.displayNumber}</TableCell>
            <TableCell>{order.customerName}</TableCell>
            <TableCell>{formatOrderDate(order.createdAt)}</TableCell>
            <TableCell className="text-right">{order.totalLabel}</TableCell>
            <TableCell className="text-center">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={!order.canDownloadInvoice}
                aria-label={`Télécharger la facture ${order.displayNumber}`}
                onClick={() => void handleDownload(order)}
              >
                <FileDown />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
