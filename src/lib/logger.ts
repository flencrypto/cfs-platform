import { randomUUID } from 'crypto'
import pino, { type Logger } from 'pino'

const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

export const logger = pino({
  level,
  base: {
    env: process.env.NODE_ENV,
    service: 'cfs-platform',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

export function getRequestLogger(request: Request): Logger {
  const requestId = request.headers.get('x-request-id') ?? randomUUID()
  return logger.child({ requestId })
}
