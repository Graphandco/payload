import { formatInvoiceNumber } from '@/lib/invoices/formatInvoiceNumber'
import { formatOrderNumber } from '@/lib/formatOrderNumber'

type SearchableOrder = {
  orderNumber: number
  invoiceNumber?: number | null
}

function matchesFormattedNumber(
  label: string,
  rawNumber: number,
  query: string,
  digits: string,
): boolean {
  const normalizedLabel = label.toLowerCase()
  return (
    normalizedLabel.includes(query) || (digits.length > 0 && String(rawNumber).includes(digits))
  )
}

export function matchesOrderSearch(order: SearchableOrder, search: string): boolean {
  const query = search.trim().toLowerCase()
  if (!query) {
    return true
  }

  const digits = query.replace(/\D/g, '')

  if (
    matchesFormattedNumber(formatOrderNumber(order.orderNumber), order.orderNumber, query, digits)
  ) {
    return true
  }

  if (order.invoiceNumber != null) {
    return matchesFormattedNumber(
      formatInvoiceNumber(order.invoiceNumber),
      order.invoiceNumber,
      query,
      digits,
    )
  }

  return false
}
