import { formatServiceName } from '@/lib/utils'

describe('formatServiceName', () => {
  it('converts camelCase keys to spaced title case', () => {
    expect(formatServiceName('sportsData')).toBe('Sports Data')
  })

  it('uppercases short abbreviations', () => {
    expect(formatServiceName('kyc')).toBe('KYC')
  })

  it('handles single word keys', () => {
    expect(formatServiceName('database')).toBe('Database')
  })

  it('handles kebab and snake case inputs', () => {
    expect(formatServiceName('feature-flags')).toBe('Feature Flags')
    expect(formatServiceName('redis_cache')).toBe('Redis Cache')
  })
})
