/**
 * Formate un numéro de commande pour l'affichage client (#0001, #0042…).
 */
export function formatOrderNumber(orderNumber: number): string {
  return `#${String(orderNumber).padStart(4, '0')}`
}
