import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { appConfig } from '../infra/config.js'
import { aiLogger } from '../infra/logger.js'

/**
 * Serviço de enriquecimento de prompt.
 *
 * Utiliza um modelo leve (gemini-2.0-flash-lite) para expandir e reformular
 * a pergunta original do usuário, gerando uma versão mais rica em termos
 * relevantes para melhorar a busca vetorial (RAG) e a qualidade da resposta final.
 */
export class PromptEnrichmentService {
  private model: ChatGoogleGenerativeAI

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: appConfig.googleApiKey,
      model: 'gemini-2.5-flash-lite',
      temperature: 0.3,
      maxOutputTokens: 300,
    })
  }

  /**
   * Enriquece a pergunta do usuário expandindo termos, adicionando sinônimos
   * e contexto relevante para jogos de mesa.
   *
   * Retorna um objeto com:
   * - enrichedQuery: a pergunta reformulada para busca vetorial
   * - searchTerms: termos-chave extraídos para busca complementar
   */
  async enrichQuery(
    originalQuery: string
  ): Promise<{ enrichedQuery: string; searchTerms: string[] }> {
    try {
      aiLogger.info({ mensagemOriginal: originalQuery }, '[Enriquecimento] Mensagem ORIGINAL recebida')

      const systemPrompt = `Você é um especialista em jogos de mesa responsável por reformular perguntas de jogadores para melhorar a busca em manuais de regras.

Dado a pergunta original do usuário, você deve:
1. Reformular a pergunta de forma mais completa e específica
2. Adicionar termos técnicos de jogos de mesa que sejam relevantes (ex: turno, rodada, fase, ação, movimento, pontuação, etc.)
3. Incluir sinônimos e variações dos termos principais
4. Manter o contexto original sem inventar informações

Responda EXATAMENTE neste formato JSON (sem markdown, sem code blocks):
{
  "enrichedQuery": "pergunta reformulada e expandida aqui",
  "searchTerms": ["termo1", "termo2", "termo3"]
}

REGRAS:
- A enrichedQuery deve ter no máximo 2 frases
- searchTerms deve ter entre 3 e 6 termos relevantes
- Mantenha tudo em português brasileiro
- Não invente regras ou mecânicas que não foram mencionadas`

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(originalQuery),
      ]

      const response = await this.model.invoke(messages)
      const content =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content)

      const parsed = this.parseResponse(content, originalQuery)

      aiLogger.info(
        {
          mensagemOriginal: originalQuery,
          mensagemEnriquecida: parsed.enrichedQuery,
          termosExtraidos: parsed.searchTerms,
        },
        '[Enriquecimento] Mensagem ENRIQUECIDA gerada'
      )

      return parsed
    } catch (error) {
      aiLogger.warn(
        { err: error, originalQuery },
        'Falha no enriquecimento de prompt, usando query original'
      )
      // Fallback gracioso: retorna a query original sem enriquecimento
      return {
        enrichedQuery: originalQuery,
        searchTerms: [],
      }
    }
  }

  /**
   * Faz o parse da resposta do modelo de enriquecimento.
   * Em caso de falha no parse, retorna a query original como fallback.
   */
  private parseResponse(
    content: string,
    fallbackQuery: string
  ): { enrichedQuery: string; searchTerms: string[] } {
    try {
      // Limpar possíveis blocos de código markdown
      const cleaned = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim()

      const parsed = JSON.parse(cleaned)

      if (
        typeof parsed.enrichedQuery === 'string' &&
        Array.isArray(parsed.searchTerms)
      ) {
        return {
          enrichedQuery: parsed.enrichedQuery,
          searchTerms: parsed.searchTerms.filter(
            (t: unknown) => typeof t === 'string'
          ),
        }
      }
    } catch {
      aiLogger.warn('Falha ao fazer parse da resposta de enriquecimento')
    }

    return { enrichedQuery: fallbackQuery, searchTerms: [] }
  }

  /**
   * Combina a query enriquecida com os termos de busca para formar
   * uma query otimizada para busca vetorial.
   */
  buildSearchQuery(enrichedQuery: string, searchTerms: string[]): string {
    if (searchTerms.length === 0) {
      return enrichedQuery
    }
    return `${enrichedQuery} ${searchTerms.join(' ')}`
  }
}

export const promptEnrichmentService = new PromptEnrichmentService()
