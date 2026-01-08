import { createRoute, z } from '@hono/zod-openapi'

// Schemas Zod para validação e documentação
const ManualSchema = z.object({
  id: z.string().openapi({ example: '1704567890123' }),
  gameName: z.string().openapi({ example: 'Catan' }),
  fileName: z.string().openapi({ example: 'manual-catan.pdf' }),
  uploadDate: z.string().openapi({ example: '2026-01-06T20:00:00.000Z' }),
  indexed: z.boolean().openapi({ example: true }),
})

const UploadResponseSchema = z.object({
  manualId: z.string(),
  gameName: z.string(),
  fileName: z.string(),
  message: z.string(),
})

const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
})

const ErrorResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  error: z.string().openapi({ example: 'Mensagem de erro' }),
})

// Rota: POST /api/manuals - Upload de manual
export const uploadManualRoute = createRoute({
  method: 'post',
  path: '/api/manuals',
  tags: ['Manuais'],
  summary: 'Upload de manual de jogo',
  description: 'Faz upload de um manual em PDF e processa automaticamente para indexação vetorial',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            gameName: z.string().min(1).openapi({
              example: 'Catan',
              description: 'Nome do jogo',
            }),
            file: z.instanceof(File).openapi({
              type: 'string',
              format: 'binary',
              description: 'Arquivo PDF do manual',
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
            success: z.boolean().openapi({ example: true }),
            data: UploadResponseSchema,
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

// Rota: GET /api/manuals - Listar manuais
export const listManualsRoute = createRoute({
  method: 'get',
  path: '/api/manuals',
  tags: ['Manuais'],
  summary: 'Listar todos os manuais',
  description: 'Retorna a lista de todos os manuais cadastrados no sistema',
  responses: {
    200: {
      description: 'Lista de manuais',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: z.array(ManualSchema),
          }),
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

// Rota: GET /api/manuals/:id - Buscar manual por ID
export const getManualRoute = createRoute({
  method: 'get',
  path: '/api/manuals/{id}',
  tags: ['Manuais'],
  summary: 'Buscar manual por ID',
  description: 'Retorna os detalhes de um manual específico',
  request: {
    params: z.object({
      id: z.string().openapi({
        param: { name: 'id', in: 'path' },
        example: '1704567890123',
      }),
    }),
  },
  responses: {
    200: {
      description: 'Manual encontrado',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: ManualSchema,
          }),
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

// Rota: DELETE /api/manuals/:id - Deletar manual
export const deleteManualRoute = createRoute({
  method: 'delete',
  path: '/api/manuals/{id}',
  tags: ['Manuais'],
  summary: 'Deletar manual',
  description: 'Remove um manual e todos os seus dados associados (arquivo e embeddings)',
  request: {
    params: z.object({
      id: z.string().openapi({
        param: { name: 'id', in: 'path' },
        example: '1704567890123',
      }),
    }),
  },
  responses: {
    200: {
      description: 'Manual deletado com sucesso',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            message: z.string().openapi({ example: 'Manual deletado com sucesso' }),
          }),
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
