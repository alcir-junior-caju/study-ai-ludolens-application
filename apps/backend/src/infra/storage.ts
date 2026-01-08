import fs from 'fs/promises'
import path from 'path'
import { uploadConfig } from './config.js'
import { uploadLogger } from './logger.js'

export class FileStorage {
  private uploadDir: string

  constructor() {
    this.uploadDir = uploadConfig.uploadDir
  }

  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true })
      uploadLogger.info(`Diretório de uploads criado/verificado: ${this.uploadDir}`)
    } catch (error) {
      uploadLogger.error({ error }, 'Erro ao criar diretório de uploads')
      throw error
    }
  }

  async saveFile(file: Buffer, fileName: string): Promise<string> {
    const filePath = path.join(this.uploadDir, fileName)
    await fs.writeFile(filePath, file)
    uploadLogger.info({ fileName, filePath }, 'Arquivo salvo com sucesso')
    return filePath
  }

  async readFile(fileName: string): Promise<Buffer> {
    const filePath = path.join(this.uploadDir, fileName)
    return await fs.readFile(filePath)
  }

  async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(this.uploadDir, fileName)
    await fs.unlink(filePath)
    uploadLogger.info({ fileName }, 'Arquivo deletado')
  }

  async fileExists(fileName: string): Promise<boolean> {
    const filePath = path.join(this.uploadDir, fileName)
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }
}

export const fileStorage = new FileStorage()
