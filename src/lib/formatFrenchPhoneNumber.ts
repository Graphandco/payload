/**
 * Affichage d'un numéro au format français (paires de chiffres).
 * Ex. 0612345678 → 06 12 34 56 78, +33612345678 → 06 12 34 56 78
 */
export function formatFrenchPhoneNumber(phone: string): string {
  const trimmed = phone.trim()
  if (!trimmed) {
    return trimmed
  }

  let digits = trimmed.replace(/\D/g, '')

  if (digits.startsWith('0033')) {
    digits = `0${digits.slice(4)}`
  } else if (digits.startsWith('33') && digits.length === 11) {
    digits = `0${digits.slice(2)}`
  }

  if (digits.length === 10 && digits.startsWith('0')) {
    return digits.match(/.{1,2}/g)?.join(' ') ?? trimmed
  }

  return trimmed
}
