// Polyfills necessários para pdf-parse funcionar no Node.js
import './infra/pdf-polyfill.js'

import { OpenAPIHono } from '@hono/zod-openapi'
import { logger as honoLogger } from 'hono/logger'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { apiReference } from '@scalar/hono-api-reference'
import { validateConfig } from './infra/config.js'
import { fileStorage } from './infra/storage.js'
import { logger } from './infra/logger.js'
import { manualController } from './controllers/manual.controller.js'
import { queryController } from './controllers/query.controller.js'
import {
  uploadManualRoute,
  listManualsRoute,
  getManualRoute,
  deleteManualRoute,
} from './routes/manual.routes.js'
import { queryWithImageRoute, queryTextRoute } from './routes/query.routes.js'

const app = new OpenAPIHono()

// Middlewares globais
app.use('*', honoLogger())
app.use('*', cors())

// OpenAPI documentation
app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'LudoLens API',
    version: '1.0.0',
    description: 'Assistente IA para jogos de mesa - Análise de regras via imagem e PDF',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desenvolvimento',
    },
  ],
  tags: [
    {
      name: 'Manuais',
      description: 'Gerenciamento de manuais de jogos',
    },
    {
      name: 'Consultas',
      description: 'Consultas de regras via IA',
    },
  ],
})

// Scalar API Reference
app.get(
  '/docs',
  apiReference({
    theme: 'purple',
    spec: {
      url: '/openapi.json',
    },
  })
)

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Rota raiz
app.get('/', (c) => {
  return c.json({
    message: 'LudoLens API - Assistente IA para jogos de mesa',
    version: '1.0.0',
    documentation: '/docs',
    openapi: '/openapi.json',
    endpoints: {
      health: 'GET /health',
      manuals: {
        upload: 'POST /api/manuals',
        list: 'GET /api/manuals',
        get: 'GET /api/manuals/:id',
        delete: 'DELETE /api/manuals/:id',
      },
      query: {
        withImage: 'POST /api/query',
        textOnly: 'POST /api/query/text',
      },
    },
  })
})

// Rotas de manuais (OpenAPI)
app.openapi(uploadManualRoute, (c) => manualController.uploadManual(c))
app.openapi(listManualsRoute, (c) => manualController.listManuals(c))
app.openapi(getManualRoute, (c) => manualController.getManual(c))
app.openapi(deleteManualRoute, (c) => manualController.deleteManual(c))

// Rotas de consultas (OpenAPI)
app.openapi(queryWithImageRoute, (c) => queryController.queryWithImage(c))
app.openapi(queryTextRoute, (c) => queryController.queryWithText(c))

// Inicialização
async function startServer() {
  try {
    // Validar configurações
    validateConfig()
    logger.info('✅ Configurações validadas')

    // Inicializar storage
    await fileStorage.initialize()
    logger.info('✅ Storage inicializado')

    // Iniciar servidor
    const port = Number(process.env.PORT) || 3000
    logger.info(`🎲 LudoLens server starting on port ${port}...`)

    serve({
      fetch: app.fetch,
      port,
    })

    logger.info(`🚀 Server running at http://localhost:${port}`)
  } catch (error) {
    logger.error({ error }, '❌ Falha ao iniciar servidor')
    process.exit(1)
  }
}

startServer()
