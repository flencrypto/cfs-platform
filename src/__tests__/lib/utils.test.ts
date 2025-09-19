import { addMinutes, addHours } from 'date-fns'
import {
  cn,
  formatCurrency,
  formatNumber,
  formatPercentage,
  getTimeUntil,
} from '@/lib/utils'

describe('utils library', () => {
  it('merges class names with cn helper', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
    expect(cn('foo', undefined, ['bar', { baz: false }])).toBe('foo bar')
  })

  it('formats currency and numbers', () => {
    expect(formatCurrency(1234.56, 'USD', 'en-US')).toBe('$1,234.56')
    expect(formatNumber(12345)).toBe('12,345')
    expect(formatPercentage(0.456, 2)).toBe('0.46%')
  })

  it('calculates time until future dates', () => {
    const inTwoHours = addHours(new Date(), 2)
    expect(getTimeUntil(inTwoHours)).toMatch(/h/)

    const inThirtyMinutes = addMinutes(new Date(), 30)
    expect(getTimeUntil(inThirtyMinutes)).toMatch(/m/)
  })
})
