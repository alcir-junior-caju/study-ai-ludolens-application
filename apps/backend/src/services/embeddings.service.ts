import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { Document } from '@langchain/core/documents'
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector'
import { Pool, PoolClient } from 'pg'
import { appConfig } from '../infra/config.js'
import { aiLogger } from '../infra/logger.js'
import type { DocumentChunk } from '../types/game.types.js'

const VECTOR_DIMENSIONS = 768

export class EmbeddingsService {
  private embeddings: GoogleGenerativeAIEmbeddings
  private pool: Pool
  private vectorStore: PGVectorStore | null = null

  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: appConfig.googleApiKey,
      model: 'gemini-embedding-001',
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
      aiLogger.error({ err: error }, 'Erro ao inicializar PGVectorStore')
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

      const validChunks = chunks.filter((chunk) => chunk.content.trim().length > 0)

      if (validChunks.length === 0) {
        throw new Error('Nenhum chunk válido encontrado para indexação')
      }

      aiLogger.info(
        { manualId, original: chunks.length, valid: validChunks.length },
        'Chunks filtrados'
      )

      const documents = validChunks.map(
        (chunk) =>
          new Document({
            pageContent: chunk.content,
            metadata: {
              ...chunk.metadata,
              manualId,
            },
          })
      )

      const texts = documents.map((doc) => doc.pageContent)
      const vectors = await this.embeddings.embedDocuments(texts)

      aiLogger.info(
        {
          manualId,
          vectorCount: vectors.length,
          dimensions: vectors[0]?.length ?? 0,
          emptyVectors: vectors.filter((v) => v.length === 0).length,
        },
        'Embeddings gerados'
      )

      const validPairs = documents.reduce<{ docs: Document[]; vecs: number[][] }>(
        (acc, doc, i) => {
          if (vectors[i] && vectors[i].length > 0) {
            acc.docs.push(doc)
            acc.vecs.push(vectors[i].slice(0, VECTOR_DIMENSIONS))
          }
          return acc
        },
        { docs: [], vecs: [] }
      )

      if (validPairs.docs.length === 0) {
        throw new Error('Nenhum embedding válido foi gerado pela API')
      }

      await vectorStore.addVectors(validPairs.vecs, validPairs.docs)

      aiLogger.info({ manualId }, 'Documentos indexados com sucesso no PostgreSQL')
    } catch (error) {
      aiLogger.error({ err: error, manualId }, 'Erro ao indexar documentos')
      throw error
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

      const queryVector = await this.embeddings.embedQuery(query)
      const truncatedVector = queryVector.slice(0, VECTOR_DIMENSIONS)

      const resultsWithScore = await vectorStore.similaritySearchVectorWithScore(truncatedVector, topK, {
        manualId,
      })

      const results = resultsWithScore.map(([doc]) => doc)
      aiLogger.info({ manualId, resultsCount: results.length }, 'Documentos encontrados')
      return results
    } catch (error) {
      aiLogger.error({ err: error, manualId }, 'Erro ao buscar documentos')
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
      aiLogger.error({ err: error, manualId }, 'Erro ao remover manual')
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
      aiLogger.error({ err: error, manualId }, 'Erro ao verificar manual indexado')
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
