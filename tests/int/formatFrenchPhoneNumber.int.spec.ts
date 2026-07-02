import { describe, expect, it } from 'vitest'
import { formatFrenchPhoneNumber } from '@/lib/formatFrenchPhoneNumber'

describe('formatFrenchPhoneNumber', () => {
  it('formats a 10-digit national number', () => {
    expect(formatFrenchPhoneNumber('0612345678')).toBe('06 12 34 56 78')
    expect(formatFrenchPhoneNumber('0388123456')).toBe('03 88 12 34 56')
  })

  it('normalizes numbers already spaced or in international form', () => {
    expect(formatFrenchPhoneNumber('06 12 34 56 78')).toBe('06 12 34 56 78')
    expect(formatFrenchPhoneNumber('+33612345678')).toBe('06 12 34 56 78')
    expect(formatFrenchPhoneNumber('0033612345678')).toBe('06 12 34 56 78')
  })

  it('returns the original value for non-standard lengths', () => {
    expect(formatFrenchPhoneNumber('1234')).toBe('1234')
  })
})
