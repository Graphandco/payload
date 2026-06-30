/**
 * Export ZIP de factures sur une période (calendrier shadcn range).
 */
'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Site } from '@/payload-types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Download } from 'lucide-react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { toast } from 'sonner'

type Props = {
  site: Site
  orderSearch: string
  onOrderSearchChange: (value: string) => void
  onSessionExpired?: () => void
}

export function OrdersExportPanel({
  site,
  orderSearch,
  onOrderSearchChange,
  onSessionExpired,
}: Props) {
  const [range, setRange] = useState<DateRange | undefined>()
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    if (!range?.from || !range?.to) {
      toast.error('Sélectionnez une période complète.')
      return
    }

    setIsExporting(true)

    try {
      const from = format(range.from, 'yyyy-MM-dd')
      const to = format(range.to, 'yyyy-MM-dd')
      const params = new URLSearchParams({
        siteId: String(site.id),
        from,
        to,
      })

      const response = await fetch(`/api/orders/staff/invoices/export?${params.toString()}`, {
        credentials: 'include',
      })

      if (response.status === 401 || response.status === 403) {
        onSessionExpired?.()
        return
      }

      if (!response.ok) {
        const data = (await response.json()) as { message?: string }
        throw new Error(data.message ?? 'Export impossible.')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `factures-${from}_${to}.zip`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Export téléchargé.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export impossible.'
      toast.error(message)
    } finally {
      setIsExporting(false)
    }
  }

  const rangeLabel =
    range?.from && range?.to
      ? `${format(range.from, 'd MMM yyyy', { locale: fr })} — ${format(range.to, 'd MMM yyyy', { locale: fr })}`
      : range?.from
        ? `À partir du ${format(range.from, 'd MMM yyyy', { locale: fr })}`
        : 'Aucune période sélectionnée'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export des factures</CardTitle>
        <CardDescription>
          Sélectionnez une période pour télécharger un ZIP des factures PDF (commandes payées).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={1}
            className="rounded-lg border border-border"
          />
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{rangeLabel}</p>
            <Button
              type="button"
              onClick={() => void handleExport()}
              disabled={isExporting || !range?.from || !range?.to}
            >
              <Download />
              {isExporting ? 'Export en cours…' : 'Télécharger le ZIP'}
            </Button>
            <div className="space-y-2">
              <Label htmlFor="order-search">Filtrer par n° de commande ou de facture</Label>
              <Input
                id="order-search"
                type="search"
                value={orderSearch}
                onChange={(event) => onOrderSearchChange(event.target.value)}
                placeholder="Ex. #0042 ou F-0003"
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
