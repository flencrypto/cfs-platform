import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = (): PrismaClient => {
  try {
    return new PrismaClient()
  } catch (error) {
    const message =
      'PrismaClient failed to initialize. Run "prisma generate" and ensure database engines are available.'

    console.warn(message, error)

    return new Proxy(
      {},
      {
        get() {
          throw new Error(message)
        },
      }
    ) as PrismaClient
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
