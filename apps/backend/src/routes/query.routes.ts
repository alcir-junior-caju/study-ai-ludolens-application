import { createRoute, z } from '@hono/zod-openapi'

// Schemas para Query
const QueryRequestSchema = z.object({
  manualId: z.string().min(1).openapi({
    example: '3c07c007-ef6f-4054-ac3e-26ad2e61eedc',
    description: 'ID do manual para consultar',
  }),
  image: z.instanceof(File).openapi({
    type: 'string',
    format: 'binary',
    description: 'Imagem da situação do jogo',
  }),
  question: z.string().optional().openapi({
    example: 'Como funciona a troca de recursos no Catan?',
    description: 'Pergunta sobre as regras do jogo (opcional)',
  }),
})

const QueryTextRequestSchema = z.object({
  question: z.string().min(1).openapi({
    example: 'Quantos recursos iniciais cada jogador recebe?',
  }),
  manualId: z.string().optional().openapi({
    example: '1704567890123',
  }),
})

const QueryResponseSchema = z.object({
  answer: z.string().openapi({
    example: 'No Catan, você pode trocar recursos com outros jogadores...',
  }),
  sources: z.array(
    z.object({
      content: z.string(),
      gameName: z.string(),
    })
  ).openapi({
    example: [
      {
        content: 'Trecho do manual sobre troca de recursos...',
        gameName: 'Catan',
      },
    ],
  }),
  imageAnalysis: z.string().optional().openapi({
    example: 'Na imagem, vejo que você tem 3 madeiras e 2 tijolos...',
  }),
})

const ErrorResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  error: z.string().openapi({ example: 'Mensagem de erro' }),
})

// Rota: POST /api/query - Query com imagem
export const queryWithImageRoute = createRoute({
  method: 'post',
  path: '/api/query',
  tags: ['Consultas'],
  summary: 'Consultar regras com imagem',
  description:
    'Faz uma pergunta sobre as regras do jogo e opcionalmente envia uma imagem da situação atual do tabuleiro',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: QueryRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Resposta gerada com sucesso',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: QueryResponseSchema,
          }),
        },
      },
    },
    400: {
      description: 'Requisição inválida',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Manual não encontrado',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    409: {
      description: 'Manual ainda está sendo processado',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Erro interno do servidor',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// Rota: POST /api/query/text - Query apenas texto
export const queryTextRoute = createRoute({
  method: 'post',
  path: '/api/query/text',
  tags: ['Consultas'],
  summary: 'Consultar regras apenas com texto',
  description: 'Faz uma pergunta sobre as regras do jogo usando apenas texto, sem imagem',
  request: {
    body: {
      content: {
        'application/json': {
          schema: QueryTextRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Resposta gerada com sucesso',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: QueryResponseSchema,
          }),
        },
      },
    },
    400: {
      description: 'Requisição inválida',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Manual não encontrado',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    409: {
      description: 'Manual ainda está sendo processado',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Erro interno do servidor',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})
