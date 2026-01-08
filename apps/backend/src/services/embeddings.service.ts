import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { Document } from '@langchain/core/documents'
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector'
import { Pool, PoolClient } from 'pg'
import { appConfig } from '../infra/config.js'
import { aiLogger } from '../infra/logger.js'
import type { DocumentChunk } from '../types/game.types.js'

export class EmbeddingsService {
  private embeddings: GoogleGenerativeAIEmbeddings
  private pool: Pool
  private vectorStore: PGVectorStore | null = null

  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: appConfig.googleApiKey,
      model: 'text-embedding-004',
    })

    this.pool = new Pool({
      connectionString: appConfig.databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    this.initializeVectorStore()
  }

  /**
   * Inicializa o vector store com pgvector
   */
  private async initializeVectorStore(): Promise<void> {
    try {
      aiLogger.info('Inicializando PGVectorStore...')

      this.vectorStore = await PGVectorStore.initialize(this.embeddings, {
        pool: this.pool,
        tableName: 'game_manuals_vectors',
        columns: {
          idColumnName: 'id',
          vectorColumnName: 'embedding',
          contentColumnName: 'content',
          metadataColumnName: 'metadata',
        },
      })

      aiLogger.info('PGVectorStore inicializado com sucesso')
    } catch (error) {
      aiLogger.error({ error }, 'Erro ao inicializar PGVectorStore')
      throw error
    }
  }

  /**
   * Garante que o vector store está inicializado
   */
  private async ensureVectorStore(): Promise<PGVectorStore> {
    if (!this.vectorStore) {
      await this.initializeVectorStore()
    }
    if (!this.vectorStore) {
      throw new Error('Vector store não pôde ser inicializado')
    }
    return this.vectorStore
  }

  /**
   * Gera embeddings e indexa chunks no vector store
   */
  async indexDocuments(manualId: string, chunks: DocumentChunk[]): Promise<void> {
    try {
      aiLogger.info({ manualId, chunkCount: chunks.length }, 'Iniciando indexação de documentos')

      const vectorStore = await this.ensureVectorStore()

      const documents = chunks.map(
        (chunk) =>
          new Document({
            pageContent: chunk.content,
            metadata: {
              ...chunk.metadata,
              manualId, // Adiciona manualId aos metadados para filtrar depois
            },
          })
      )

      await vectorStore.addDocuments(documents)

      aiLogger.info({ manualId }, 'Documentos indexados com sucesso no PostgreSQL')
    } catch (error) {
      aiLogger.error({ error, manualId }, 'Erro ao indexar documentos')
      throw new Error('Falha ao gerar embeddings')
    }
  }

  /**
   * Busca documentos similares baseado em uma query
   */
  async searchSimilarDocuments(
    manualId: string,
    query: string,
    topK: number = 3
  ): Promise<Document[]> {
    try {
      aiLogger.info({ manualId, query, topK }, 'Buscando documentos similares')

      const vectorStore = await this.ensureVectorStore()

      // Busca com filtro para retornar apenas documentos do manual específico
      const results = await vectorStore.similaritySearch(query, topK, {
        manualId,
      })

      aiLogger.info({ manualId, resultsCount: results.length }, 'Documentos encontrados')
      return results
    } catch (error) {
      aiLogger.error({ error, manualId }, 'Erro ao buscar documentos')
      throw new Error('Falha na busca de documentos')
    }
  }

  /**
   * Remove um manual do vector store
   */
  async removeManual(manualId: string): Promise<boolean> {
    try {
      aiLogger.info({ manualId }, 'Removendo manual do vector store')

      const client = await this.pool.connect()
      try {
        const result = await client.query(
          `DELETE FROM game_manuals_vectors WHERE metadata->>'manualId' = $1`,
          [manualId]
        )

        aiLogger.info({ manualId, deletedRows: result.rowCount }, 'Manual removido com sucesso')
        return (result.rowCount ?? 0) > 0
      } finally {
        client.release()
      }
    } catch (error) {
      aiLogger.error({ error, manualId }, 'Erro ao remover manual')
      return false
    }
  }

  /**
   * Verifica se um manual está indexado
   */
  async isManualIndexed(manualId: string): Promise<boolean> {
    try {
      const client = await this.pool.connect()
      try {
        const result = await client.query(
          `SELECT EXISTS(SELECT 1 FROM game_manuals_vectors WHERE metadata->>'manualId' = $1)`,
          [manualId]
        )
        return result.rows[0].exists
      } finally {
        client.release()
      }
    } catch (error) {
      aiLogger.error({ error, manualId }, 'Erro ao verificar manual indexado')
      return false
    }
  }

  /**
   * Fecha o pool de conexões
   */
  async close(): Promise<void> {
    await this.pool.end()
    aiLogger.info('Pool de conexões PostgreSQL fechado')
  }
}

export const embeddingsService = new EmbeddingsService()
