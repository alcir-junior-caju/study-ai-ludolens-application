import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

// Schemas de validação OpenAPI
export const GameManualSchema = z
  .object({
    id: z.string().uuid(),
    gameName: z.string(),
    fileName: z.string(),
    filePath: z.string(),
    uploadedAt: z.string().datetime(),
    processedAt: z.string().datetime().optional(),
    isProcessed: z.boolean(),
  })
  .openapi('GameManual')

export const ApiResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.any().optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  })
  .openapi('ApiResponse')

export const UploadResponseSchema = z
  .object({
    manualId: z.string().uuid(),
    gameName: z.string(),
    fileName: z.string(),
    message: z.string(),
  })
  .openapi('UploadResponse')

export const QueryResponseSchema = z
  .object({
    answer: z.string(),
    confidence: z.number().optional(),
    sourcePages: z.array(z.number()).optional(),
  })
  .openapi('QueryResponse')

// Rotas OpenAPI
export const uploadManualRoute = createRoute({
  method: 'post',
  path: '/manuals',
  tags: ['Manuais'],
  summary: 'Upload de manual de jogo',
  description: 'Faz upload de um manual em PDF e inicia o processamento para indexação',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            gameName: z.string().min(1).openapi({
              description: 'Nome do jogo',
              example: 'Ticket to Ride',
            }),
            file: z.instanceof(File).openapi({
              description: 'Arquivo PDF do manual',
              type: 'string',
              format: 'binary',
            }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Manual enviado com sucesso',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: UploadResponseSchema,
          }),
        },
      },
    },
    400: {
      description: 'Dados inválidos',
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
    },
  },
})

export const listManualsRoute = createRoute({
  method: 'get',
  path: '/manuals',
  tags: ['Manuais'],
  summary: 'Lista todos os manuais',
  description: 'Retorna a lista de todos os manuais cadastrados',
  responses: {
    200: {
      description: 'Lista de manuais',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.array(GameManualSchema),
          }),
        },
      },
    },
  },
})

export const getManualRoute = createRoute({
  method: 'get',
  path: '/manuals/{id}',
  tags: ['Manuais'],
  summary: 'Busca manual por ID',
  description: 'Retorna os detalhes de um manual específico',
  request: {
    params: z.object({
      id: z.string().uuid().openapi({
        description: 'ID do manual',
        example: '123e4567-e89b-12d3-a456-426614174000',
      }),
    }),
  },
  responses: {
    200: {
      description: 'Manual encontrado',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: GameManualSchema,
          }),
        },
      },
    },
    404: {
      description: 'Manual não encontrado',
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
    },
  },
})

export const deleteManualRoute = createRoute({
  method: 'delete',
  path: '/manuals/{id}',
  tags: ['Manuais'],
  summary: 'Remove um manual',
  description: 'Remove um manual e seus dados indexados',
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Manual removido',
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
    },
    404: {
      description: 'Manual não encontrado',
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
    },
  },
})

export const queryWithImageRoute = createRoute({
  method: 'post',
  path: '/query',
  tags: ['Consultas'],
  summary: 'Consulta de regra com imagem',
  description: 'Analisa uma foto da mesa de jogo e responde qual regra se aplica',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            manualId: z.string().uuid().openapi({
              description: 'ID do manual do jogo',
              example: '123e4567-e89b-12d3-a456-426614174000',
            }),
            image: z.instanceof(File).openapi({
              description: 'Foto da mesa de jogo',
              type: 'string',
              format: 'binary',
            }),
            question: z.string().optional().openapi({
              description: 'Pergunta opcional sobre a situação',
              example: 'Posso colocar dois trens nesta rota?',
            }),
          }),
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
            success: z.boolean(),
            data: QueryResponseSchema,
          }),
        },
      },
    },
    400: {
      description: 'Dados inválidos',
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
    },
    404: {
      description: 'Manual não encontrado',
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
    },
  },
})

export const queryWithTextRoute = createRoute({
  method: 'post',
  path: '/query/text',
  tags: ['Consultas'],
  summary: 'Consulta de regra apenas com texto',
  description: 'Responde uma pergunta sobre as regras baseado no manual',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            manualId: z.string().uuid().openapi({
              description: 'ID do manual do jogo',
            }),
            question: z.string().min(1).openapi({
              description: 'Pergunta sobre as regras',
              example: 'Como funciona o sistema de pontuação?',
            }),
          }),
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
            success: z.boolean(),
            data: QueryResponseSchema,
          }),
        },
      },
    },
  },
})
