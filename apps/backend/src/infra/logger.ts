import pino from 'pino'
import { appConfig } from './config.js'

export const logger = pino({
  level: appConfig.nodeEnv === 'production' ? 'info' : 'debug',
  transport:
    appConfig.nodeEnv === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
})

// Logger específico para operações de IA
export const aiLogger = logger.child({ module: 'ai' })

// Logger para operações de upload
export const uploadLogger = logger.child({ module: 'upload' })
