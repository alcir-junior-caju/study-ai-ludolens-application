import { v4 as uuidv4 } from 'uuid'
import { Pool } from 'pg'
import { fileStorage } from '../infra/storage.js'
import { pdfService } from './pdf.service.js'
import { embeddingsService } from './embeddings.service.js'
import { uploadLogger } from '../infra/logger.js'
import { appConfig } from '../infra/config.js'
import type { GameManual, ProcessedDocument } from '../types/game.types.js'

export class ManualService {
  private pool: Pool

  constructor() {
    this.pool = new Pool({
      connectionString: appConfig.databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }

  /**
   * Processa upload de um manual de jogo
   */
  async uploadManual(gameName: string, file: Buffer, fileName: string): Promise<GameManual> {
    const manualId = uuidv4()
    uploadLogger.info({ manualId, gameName, fileName }, 'Iniciando upload de manual')

    try {
      // 1. Salvar arquivo
      const filePath = await fileStorage.saveFile(file, `${manualId}.pdf`)

      // 2. Criar registro do manual no banco de dados
      const manual: GameManual = {
        id: manualId,
        gameName,
        fileName,
        filePath,
        uploadedAt: new Date(),
        isProcessed: false,
      }

      await this.pool.query(
        `INSERT INTO game_manuals (id, game_name, file_name, file_path, uploaded_at, is_processed)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [manualId, gameName, fileName, filePath, manual.uploadedAt, false]
      )

      // 3. Processar PDF em background (assíncrono)
      this.processManual(manualId, file).catch((error) => {
        uploadLogger.error({ error, manualId }, 'Erro no processamento do manual')
      })

      uploadLogger.info({ manualId }, 'Manual salvo, processamento iniciado')
      return manual
    } catch (error) {
      uploadLogger.error({ error, manualId }, 'Erro ao fazer upload do manual')
      throw new Error('Falha ao fazer upload do manual')
    }
  }

  /**
   * Processa o PDF: extrai texto, divide em chunks, gera embeddings
   */
  private async processManual(manualId: string, fileBuffer: Buffer): Promise<void> {
    uploadLogger.info({ manualId }, 'Processando manual')

    try {
      // 1. Extrair texto
      const text = await pdfService.extractText(fileBuffer)

      // 2. Dividir em chunks
      const chunks = await pdfService.splitIntoChunks(text, manualId)

      // 3. Gerar embeddings e indexar
      await embeddingsService.indexDocuments(manualId, chunks)

      // 4. Atualizar status no banco de dados
      await this.pool.query(
        `UPDATE game_manuals
         SET is_processed = $1, processed_at = $2
         WHERE id = $3`,
        [true, new Date(), manualId]
      )

      // 5. Deletar arquivo PDF após processamento bem-sucedido
      try {
        await fileStorage.deleteFile(`${manualId}.pdf`)
        uploadLogger.info({ manualId }, 'Arquivo PDF removido após processamento')
      } catch (error) {
        uploadLogger.warn({ error, manualId }, 'Não foi possível remover arquivo PDF')
      }

      uploadLogger.info({ manualId }, 'Manual processado com sucesso')
    } catch (error) {
      uploadLogger.error({ error, manualId }, 'Erro ao processar manual')
      throw error
    }
  }

  /**
   * Busca um manual por ID
   */
  async getManual(manualId: string): Promise<GameManual | undefined> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM game_manuals WHERE id = $1',
        [manualId]
      )

      if (result.rows.length === 0) {
        return undefined
      }

      const row = result.rows[0]
      return {
        id: row.id,
        gameName: row.game_name,
        fileName: row.file_name,
        filePath: row.file_path,
        uploadedAt: row.uploaded_at,
        isProcessed: row.is_processed,
        processedAt: row.processed_at,
      }
    } catch (error) {
      uploadLogger.error({ error, manualId }, 'Erro ao buscar manual')
      return undefined
    }
  }

  /**
   * Lista todos os manuais
   */
  async listManuals(): Promise<GameManual[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM game_manuals ORDER BY uploaded_at DESC'
      )

      return result.rows.map(row => ({
        id: row.id,
        gameName: row.game_name,
        fileName: row.file_name,
        filePath: row.file_path,
        uploadedAt: row.uploaded_at,
        isProcessed: row.is_processed,
        processedAt: row.processed_at,
      }))
    } catch (error) {
      uploadLogger.error({ error }, 'Erro ao listar manuais')
      return []
    }
  }

  /**
   * Deleta um manual
   */
  async deleteManual(manualId: string): Promise<boolean> {
    const manual = await this.getManual(manualId)
    if (!manual) {
      return false
    }

    try {
      // Tentar remover arquivo (pode já ter sido deletado após processamento)
      try {
        await fileStorage.deleteFile(`${manualId}.pdf`)
      } catch (error) {
        uploadLogger.debug({ manualId }, 'Arquivo PDF já foi removido anteriormente')
      }

      // Remover do vector store (agora é async)
      await embeddingsService.removeManual(manualId)

      // Remover do banco de dados
      await this.pool.query('DELETE FROM game_manuals WHERE id = $1', [manualId])

      uploadLogger.info({ manualId }, 'Manual deletado')
      return true
    } catch (error) {
      uploadLogger.error({ error, manualId }, 'Erro ao deletar manual')
      return false
    }
  }
}

export const manualService = new ManualService()
