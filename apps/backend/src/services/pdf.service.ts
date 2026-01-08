import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { uploadLogger } from '../infra/logger.js'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import type { DocumentChunk } from '../types/game.types.js'

export class PDFService {
  private textSplitter: RecursiveCharacterTextSplitter

  constructor() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })
  }

  /**
   * Extrai texto de um arquivo PDF usando LangChain PDFLoader
   */
  async extractText(pdfBuffer: Buffer): Promise<string> {
    let tempFilePath: string | null = null

    try {
      uploadLogger.info('Iniciando extração de texto do PDF')

      // PDFLoader precisa de um caminho de arquivo, então salvamos temporariamente
      tempFilePath = join(tmpdir(), `temp-${Date.now()}.pdf`)
      await writeFile(tempFilePath, pdfBuffer)

      // Carregar PDF usando LangChain
      const loader = new PDFLoader(tempFilePath)
      const docs = await loader.load()

      // Combinar texto de todas as páginas
      const text = docs.map(doc => doc.pageContent).join('\n\n')

      uploadLogger.info(
        { pages: docs.length, textLength: text.length },
        'Texto extraído com sucesso'
      )

      return text
    } catch (error) {
      uploadLogger.error(
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        },
        'Erro ao extrair texto do PDF'
      )
      throw new Error(`Falha ao processar PDF: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      // Limpar arquivo temporário
      if (tempFilePath) {
        try {
          await unlink(tempFilePath)
        } catch (cleanupError) {
          uploadLogger.warn({ tempFilePath }, 'Falha ao remover arquivo temporário')
        }
      }
    }
  }

  /**
   * Divide o texto em chunks menores para processamento
   */
  async splitIntoChunks(text: string, manualId: string): Promise<DocumentChunk[]> {
    try {
      uploadLogger.info('Dividindo texto em chunks')
      const documents = await this.textSplitter.createDocuments([text])

      const chunks: DocumentChunk[] = documents.map((doc, index) => ({
        id: `${manualId}-chunk-${index}`,
        content: doc.pageContent,
        metadata: {
          ...doc.metadata,
          chunkIndex: index,
          manualId,
        },
      }))

      uploadLogger.info({ chunkCount: chunks.length }, 'Texto dividido em chunks')
      return chunks
    } catch (error) {
      uploadLogger.error({ error }, 'Erro ao dividir texto em chunks')
      throw new Error('Falha ao processar documento')
    }
  }
}

export const pdfService = new PDFService()
