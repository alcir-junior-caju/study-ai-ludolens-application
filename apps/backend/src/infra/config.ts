import { config } from 'dotenv'

// Carregar variáveis de ambiente
config()

export const appConfig = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  googleApiKey: process.env.GOOGLE_API_KEY || '',
  databaseUrl: process.env.DATABASE_URL || '',
}

// Validar configurações críticas
export function validateConfig(): void {
  if (!appConfig.googleApiKey) {
    throw new Error('GOOGLE_API_KEY é obrigatória. Configure no arquivo .env')
  }

  if (!appConfig.databaseUrl) {
    throw new Error('DATABASE_URL é obrigatória. Configure no arquivo .env')
  }
}

// Upload configuration
export const uploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['application/pdf'],
  uploadDir: './uploads',
}
