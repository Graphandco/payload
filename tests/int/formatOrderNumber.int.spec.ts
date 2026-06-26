import { describe, expect, it } from 'vitest'
import { formatOrderNumber } from '@/lib/formatOrderNumber'

describe('formatOrderNumber', () => {
  it('pads order numbers', () => {
    expect(formatOrderNumber(1)).toBe('#0001')
    expect(formatOrderNumber(42)).toBe('#0042')
    expect(formatOrderNumber(1234)).toBe('#1234')
  })
})
