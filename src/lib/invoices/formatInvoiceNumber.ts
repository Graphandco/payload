/**
 * Format d'affichage d'un numéro de facture (F-0001).
 */
export function formatInvoiceNumber(invoiceNumber: number): string {
  return `F-${String(invoiceNumber).padStart(4, '0')}`
}
