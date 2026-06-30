import { describe, expect, it } from 'vitest'
import { formatInvoiceNumber } from '@/lib/invoices/formatInvoiceNumber'
import { getOrdersPageLimit } from '@/lib/orders/listStaffOrders'
import { matchesOrderSearch } from '@/lib/orders/matchesOrderSearch'

describe('formatInvoiceNumber', () => {
  it('pads invoice numbers', () => {
    expect(formatInvoiceNumber(1)).toBe('F-0001')
    expect(formatInvoiceNumber(42)).toBe('F-0042')
  })
})

describe('getOrdersPageLimit', () => {
  it('reads ORDERS_PAGE_LIMIT from the environment', () => {
    const previous = process.env.ORDERS_PAGE_LIMIT
    process.env.ORDERS_PAGE_LIMIT = '25'
    expect(getOrdersPageLimit()).toBe(25)
    process.env.ORDERS_PAGE_LIMIT = previous
  })

  it('falls back when ORDERS_PAGE_LIMIT is missing or invalid', () => {
    const previous = process.env.ORDERS_PAGE_LIMIT
    delete process.env.ORDERS_PAGE_LIMIT
    expect(getOrdersPageLimit()).toBe(50)
    process.env.ORDERS_PAGE_LIMIT = 'abc'
    expect(getOrdersPageLimit()).toBe(50)
    process.env.ORDERS_PAGE_LIMIT = previous
  })
})

describe('matchesOrderSearch', () => {
  it('matches invoice numbers', () => {
    expect(matchesOrderSearch({ orderNumber: 1, invoiceNumber: 3 }, '')).toBe(true)
    expect(matchesOrderSearch({ orderNumber: 1, invoiceNumber: 3 }, 'F-0003')).toBe(true)
    expect(matchesOrderSearch({ orderNumber: 1, invoiceNumber: 3 }, '0003')).toBe(true)
    expect(matchesOrderSearch({ orderNumber: 1, invoiceNumber: 3 }, '42')).toBe(false)
    expect(matchesOrderSearch({ orderNumber: 1, invoiceNumber: null }, 'F-0001')).toBe(false)
  })

  it('matches order numbers', () => {
    expect(matchesOrderSearch({ orderNumber: 42, invoiceNumber: null }, '#0042')).toBe(true)
    expect(matchesOrderSearch({ orderNumber: 42, invoiceNumber: null }, '42')).toBe(true)
    expect(matchesOrderSearch({ orderNumber: 42, invoiceNumber: null }, '0042')).toBe(true)
    expect(matchesOrderSearch({ orderNumber: 42, invoiceNumber: null }, 'F-0003')).toBe(false)
  })
})
