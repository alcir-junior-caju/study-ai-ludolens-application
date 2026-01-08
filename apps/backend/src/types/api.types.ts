import { z } from 'zod'

// Schema de validação para upload de manual
export const UploadManualSchema = z.object({
  gameName: z.string().min(1, 'Nome do jogo é obrigatório'),
})

// Schema de validação para consulta de regra
export const QueryRuleSchema = z.object({
  manualId: z.string().uuid('ID do manual inválido'),
  question: z.string().optional(),
})

// Tipos inferidos dos schemas
export type UploadManualInput = z.infer<typeof UploadManualSchema>
export type QueryRuleInput = z.infer<typeof QueryRuleSchema>

// Tipos de resposta da API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface UploadResponse {
  manualId: string
  gameName: string
  fileName: string
  message: string
}

export interface QueryResponse {
  answer: string
  confidence?: number
  sourcePages?: number[]
}
