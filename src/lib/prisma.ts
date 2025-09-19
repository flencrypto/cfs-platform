import { PrismaClient } from '@prisma/client'

const PRISMA_INIT_MESSAGE =
  'PrismaClient failed to initialize. Run "prisma generate" and ensure database engines are available.'

export class PrismaUnavailableError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'PrismaUnavailableError'
  }
}

type GlobalPrismaState = {
  prisma?: PrismaClient
  prismaInitError?: PrismaUnavailableError
}

const globalForPrisma = globalThis as unknown as GlobalPrismaState

const ensurePrismaClient = (): PrismaClient => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  if (globalForPrisma.prismaInitError) {
    throw globalForPrisma.prismaInitError
  }

  try {
    const client = new PrismaClient()

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client
    }

    return client
  } catch (error) {
    const prismaError =
      error instanceof PrismaUnavailableError
        ? error
        : new PrismaUnavailableError(PRISMA_INIT_MESSAGE, error)

    if (!globalForPrisma.prismaInitError) {
      console.warn(PRISMA_INIT_MESSAGE, error)
    }

    globalForPrisma.prismaInitError = prismaError
    throw prismaError
  }
}

export const prisma = new Proxy(
  {},
  {
    get(_target, prop, receiver) {
      const client = ensurePrismaClient()
      const value = Reflect.get(client, prop, receiver)
      return typeof value === 'function' ? value.bind(client) : value
    },
  }
) as PrismaClient

export const getPrismaClient = (): PrismaClient => ensurePrismaClient()

export const isPrismaClientUnavailable = (error: unknown): error is PrismaUnavailableError => {
  if (error instanceof PrismaUnavailableError) {
    return true
  }

  if (error instanceof Error) {
    return error.message.includes(PRISMA_INIT_MESSAGE)
  }

  return false
}
