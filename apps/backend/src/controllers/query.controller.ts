import { Context } from 'hono'
import { ruleAgent } from '../agents/rule-agent.js'
import { manualService } from '../services/manual.service.js'
import { embeddingsService } from '../services/embeddings.service.js'

export class QueryController {
  /**
   * POST /query - Consulta de regra com imagem
   */
  async queryWithImage(c: Context) {
    console.log('🎯 queryWithImage iniciado')
    try {
      console.log('📦 Fazendo parse do body...')
      const body = await c.req.parseBody()
      console.log('✅ Body parseado:', Object.keys(body))
      const manualId = body['manualId']
      const image = body['image']
      const question = body['question']

      // Validações
      if (!manualId || typeof manualId !== 'string') {
        return c.json(
          {
            success: false,
            error: 'ID do manual é obrigatório',
          },
          400
        )
      }

      if (!image || !(image instanceof File)) {
        return c.json(
          {
            success: false,
            error: 'Imagem é obrigatória',
          },
          400
        )
      }

      // Validar tipo de imagem
      if (!image.type.startsWith('image/')) {
        return c.json(
          {
            success: false,
            error: 'Arquivo deve ser uma imagem',
          },
          400
        )
      }

      // Verificar se manual existe e está processado
      const manual = await manualService.getManual(manualId)
      if (!manual) {
        return c.json(
          {
            success: false,
            error: 'Manual não encontrado',
          },
          404
        )
      }

      if (!manual.isProcessed) {
        return c.json(
          {
            success: false,
            error: 'Manual ainda está sendo processado. Aguarde alguns instantes.',
          },
          409
        )
      }

      // Verificar se manual está indexado
      if (!embeddingsService.isManualIndexed(manualId)) {
        return c.json(
          {
            success: false,
            error: 'Manual não está disponível para consultas',
          },
          500
        )
      }

      // Converter imagem para base64
      const arrayBuffer = await image.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const imageBase64 = buffer.toString('base64')

      // Buscar documentos relevantes para incluir como sources
      const questionText = typeof question === 'string' ? question : 'Qual regra se aplica a esta situação de jogo?'
      const relevantDocs = await embeddingsService.searchSimilarDocuments(manualId, questionText, 3)

      // Processar consulta
      console.log('🤖 Chamando ruleAgent...')
      const answer = await ruleAgent.analyzeGameQuery(manualId, imageBase64, questionText)
      console.log('✅ Resposta recebida do agent')

      const response = c.json(
        {
          success: true,
          data: {
            answer,
            sources: relevantDocs.map((doc) => ({
              content: doc.pageContent.substring(0, 200) + '...', // Truncar para não ficar muito grande
              gameName: manual.gameName,
            })),
            imageAnalysis: 'Análise visual incluída na resposta',
          },
        },
        200
      )
      console.log('✅ Retornando resposta JSON')
      return response
    } catch (error) {
      console.error('Erro no queryWithImage:', error)
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Erro ao processar consulta',
        },
        500
      )
    }
  }

  /**
   * POST /query/text - Consulta de regra apenas com texto
   */
  async queryWithText(c: Context) {
    try {
      const body = await c.req.json()
      const { manualId, question } = body

      // Validações
      if (!manualId || typeof manualId !== 'string') {
        return c.json(
          {
            success: false,
            error: 'ID do manual é obrigatório',
          },
          400
        )
      }

      if (!question || typeof question !== 'string') {
        return c.json(
          {
            success: false,
            error: 'Pergunta é obrigatória',
          },
          400
        )
      }

      // Verificar se manual existe e está processado
      const manual = await manualService.getManual(manualId)
      if (!manual) {
        return c.json(
          {
            success: false,
            error: 'Manual não encontrado',
          },
          404
        )
      }

      if (!manual.isProcessed) {
        return c.json(
          {
            success: false,
            error: 'Manual ainda está sendo processado',
          },
          409
        )
      }

      // Buscar documentos relevantes
      const relevantDocs = await embeddingsService.searchSimilarDocuments(manualId, question, 3)

      // Processar consulta
      const answer = await ruleAgent.answerTextQuery(manualId, question)

      return c.json(
        {
          success: true,
          data: {
            answer,
            sources: relevantDocs.map((doc) => ({
              content: doc.pageContent.substring(0, 200) + '...',
              gameName: manual.gameName,
            })),
          },
        },
        200
      )
    } catch (error) {
      console.error('Erro no queryWithText:', error)
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Erro ao processar consulta',
        },
        500
      )
    }
  }
}

export const queryController = new QueryController()
