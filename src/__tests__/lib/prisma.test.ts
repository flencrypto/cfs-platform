import { prisma, PrismaUnavailableError, isPrismaClientUnavailable } from '@/lib/prisma'

describe('prisma fallback behaviour', () => {
  it('throws PrismaUnavailableError when Prisma client cannot initialize', () => {
    expect(() => (prisma as unknown as Record<string, unknown>).user).toThrow(PrismaUnavailableError)
  })

  it('detects PrismaUnavailableError instances', () => {
    const error = new PrismaUnavailableError('Test error')
    expect(isPrismaClientUnavailable(error)).toBe(true)
  })

  it('detects initialization message in generic errors', () => {
    const error = new Error(
      'PrismaClient failed to initialize. Run "prisma generate" and ensure database engines are available.'
    )
    expect(isPrismaClientUnavailable(error)).toBe(true)
  })

  it('ignores non-Prisma errors', () => {
    expect(isPrismaClientUnavailable(new Error('Different error'))).toBe(false)
  })
})
