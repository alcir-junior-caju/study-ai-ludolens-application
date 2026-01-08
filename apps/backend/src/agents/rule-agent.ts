import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'
import { appConfig } from '../infra/config.js'
import { aiLogger } from '../infra/logger.js'
import { embeddingsService } from '../services/embeddings.service.js'

export class RuleAgent {
  private model: ChatGoogleGenerativeAI

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: appConfig.googleApiKey,
      model: 'gemini-2.0-flash-exp',
      temperature: 0.2, // Baixa temperatura para respostas mais precisas
    })
  }

  /**
   * Analisa uma imagem do jogo e responde a dúvida baseado no manual
   */
  async analyzeGameQuery(
    manualId: string,
    imageBase64: string,
    userQuestion?: string
  ): Promise<string> {
    try {
      aiLogger.info({ manualId }, 'Iniciando análise de consulta')

      // 1. Se há pergunta explícita, usar para busca contextual
      const searchQuery = userQuestion || 'Qual regra se aplica a esta situação de jogo?'

      // 2. Buscar documentos relevantes do manual
      const relevantDocs = await embeddingsService.searchSimilarDocuments(manualId, searchQuery, 3)

      // 3. Construir contexto do manual
      const manualContext = relevantDocs.map((doc, idx) => `[Trecho ${idx + 1}]\n${doc.pageContent}`).join('\n\n')

      // 4. Construir prompt do sistema
      const systemPrompt = `
        Você é um assistente especializado em jogos de mesa.

        Sua função é analisar a foto da mesa de jogo e explicar qual regra do manual se aplica à situação mostrada.

        CONTEXTO DO MANUAL:
        ${manualContext}

        INSTRUÇÕES:
        1. Analise a imagem cuidadosamente para entender o estado do jogo
        2. Identifique qual regra do manual é relevante para a situação
        3. Explique a regra de forma clara e objetiva em português brasileiro
        4. Se a situação não estiver clara na imagem, peça mais informações
        5. Se não encontrar uma regra específica no contexto fornecido, diga isso claramente

        Responda de forma direta e útil para que os jogadores possam continuar a partida rapidamente.
      `

      // 5. Construir mensagem do usuário
      const userPrompt = userQuestion
        ? `${userQuestion}\n\n[Imagem da mesa de jogo anexada]`
        : 'Qual regra se aplica a esta situação mostrada na imagem?'

      // 6. Invocar o modelo com a imagem
      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage({
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            {
              type: 'image_url',
              image_url: `data:image/jpeg;base64,${imageBase64}`,
            },
          ],
        }),
      ]

      aiLogger.info('Invocando modelo Gemini com imagem')
      const stream = await this.model.stream(messages)

      let answer = ''
      for await (const chunk of stream) {
        if (typeof chunk.content === 'string') {
          answer += chunk.content
        }
      }
      aiLogger.info({ answerLength: answer.length }, 'Resposta gerada com sucesso')

      return answer
    } catch (error) {
      aiLogger.error({ error, manualId }, 'Erro ao analisar consulta')
      throw new Error('Falha ao processar consulta')
    }
  }

  /**
   * Responde uma pergunta apenas com texto (sem imagem)
   */
  async answerTextQuery(manualId: string, question: string): Promise<string> {
    try {
      aiLogger.info({ manualId, question }, 'Processando consulta de texto')

      // Buscar contexto relevante
      const relevantDocs = await embeddingsService.searchSimilarDocuments(manualId, question, 3)

      const context = relevantDocs.map((doc) => doc.pageContent).join('\n\n')

      const systemPrompt = `
        Você é um assistente especializado em jogos de mesa.
        Responda a pergunta do usuário baseado nas regras do manual fornecidas abaixo.
        Seja claro, objetivo e responda em português brasileiro.

        CONTEXTO DO MANUAL: ${context}
      `

      const messages = [new SystemMessage(systemPrompt), new HumanMessage(question)]

      const stream = await this.model.stream(messages)

      let answer = ''
      for await (const chunk of stream) {
        if (typeof chunk.content === 'string') {
          answer += chunk.content
        }
      }

      return answer
    } catch (error) {
      aiLogger.error({ error, manualId }, 'Erro ao responder pergunta')
      throw new Error('Falha ao processar pergunta')
    }
  }
}

export const ruleAgent = new RuleAgent()
