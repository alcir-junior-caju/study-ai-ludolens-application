import { Context } from 'hono'
import { manualService } from '../services/manual.service.js'
import type { UploadResponse } from '../types/api.types.js'
import type { GameManual } from '../types/game.types.js'

// Helper para converter GameManual para formato da API
function toManualDTO(manual: GameManual) {
  return {
    id: manual.id,
    gameName: manual.gameName,
    fileName: manual.fileName,
    uploadDate: manual.uploadedAt.toISOString(),
    indexed: manual.isProcessed,
  }
}

export class ManualController {
  /**
   * POST /manuals - Upload de manual
   */
  async uploadManual(c: Context) {
    try {
      const body = await c.req.parseBody()
      const file = body['file']
      const gameName = body['gameName']

      if (!file || !(file instanceof File)) {
        return c.json(
          {
            success: false,
            error: 'Arquivo PDF é obrigatório',
          },
          400
        )
      }

      if (!gameName || typeof gameName !== 'string') {
        return c.json(
          {
            success: false,
            error: 'Nome do jogo é obrigatório',
          },
          400
        )
      }

      // Validar tipo de arquivo
      if (file.type !== 'application/pdf') {
        return c.json(
          {
            success: false,
            error: 'Apenas arquivos PDF são permitidos',
          },
          400
        )
      }

      // Converter File para Buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Processar upload
      const manual = await manualService.uploadManual(gameName, buffer, file.name)

      const response: UploadResponse = {
        manualId: manual.id,
        gameName: manual.gameName,
        fileName: manual.fileName,
        message: 'Manual enviado com sucesso. O processamento foi iniciado.',
      }

      return c.json(
        {
          success: true,
          data: response,
        },
        201
      )
    } catch (error) {
      return c.json(
        {
          success: false,
          error: 'Erro ao fazer upload do manual',
        },
        500
      )
    }
  }

  /**
   * GET /manuals - Lista todos os manuais
   */
  async listManuals(c: Context) {
    try {
      const manuals = await manualService.listManuals()
      return c.json(
        {
          success: true,
          data: manuals.map(toManualDTO),
        },
        200
      )
    } catch (error) {
      return c.json(
        {
          success: false,
          error: 'Erro ao listar manuais',
        },
        500
      )
    }
  }

  /**
   * GET /manuals/:id - Busca manual por ID
   */
  async getManual(c: Context) {
    try {
      const manualId = c.req.param('id')
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

      return c.json(
        {
          success: true,
          data: toManualDTO(manual),
        },
        200
      )
    } catch (error) {
      return c.json(
        {
          success: false,
          error: 'Erro ao buscar manual',
        },
        500
      )
    }
  }

  /**
   * DELETE /manuals/:id - Deleta um manual
   */
  async deleteManual(c: Context) {
    try {
      const manualId = c.req.param('id')
      const deleted = await manualService.deleteManual(manualId)

      if (!deleted) {
        return c.json(
          {
            success: false,
            error: 'Manual não encontrado',
          },
          404
        )
      }

      return c.json(
        {
          success: true,
          message: 'Manual deletado com sucesso',
        },
        200
      )
    } catch (error) {
      return c.json(
        {
          success: false,
          error: 'Erro ao deletar manual',
        },
        500
      )
    }
  }
}

export const manualController = new ManualController()
