import type { PrismaClient as PrismaClientType } from '@prisma/client'

// Lazily resolve the Prisma client so local environments without `prisma generate`
// can still build. Vercel (and any real deployment) must run the generate step so
// the actual client is available at runtime.
type PrismaClientConstructor = new () => PrismaClientType

let PrismaClient: PrismaClientConstructor

try {
  // Use eval to avoid Next.js trying to eagerly bundle the optional dependency.
  // eslint-disable-next-line no-eval, @typescript-eslint/no-unsafe-assignment
  const prismaModule = eval('require')('@prisma/client') as typeof import('@prisma/client')
  PrismaClient = prismaModule.PrismaClient as unknown as PrismaClientConstructor
} catch (error) {
  const reason = error instanceof Error ? ` Original error: ${error.message}` : ''
  const prefix = '[prisma] Prisma client could not be loaded. '
  const guidance = 'Run `pnpm prisma generate` so database access works as expected.'
  const message = `${prefix}${guidance}${reason}`

  const warnOnce = (() => {
    let warned = false
    return () => {
      if (!warned) {
        warned = true
        if (process.env.NODE_ENV === 'production') {
          // eslint-disable-next-line no-console
          console.error(message)
        } else {
          // eslint-disable-next-line no-console
          console.warn(message)
        }
      }
    }
  })()

  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  PrismaClient = class PrismaClientStub {
    constructor() {
      warnOnce()
      return new Proxy(
        {},
        {
          get: (_target, property) => {
            if (property === '$disconnect' || property === '$connect') {
              return async () => undefined
            }

            throw new Error(
              `Prisma client stub invoked for property "${String(
                property,
              )}". Run \`pnpm prisma generate\` to use the database.`,
            )
          },
        },
      ) as PrismaClientType
    }
  } as unknown as PrismaClientConstructor
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined
}

const createPrismaClient = (): PrismaClientType => {
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
      },
    ) as PrismaClientType
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
