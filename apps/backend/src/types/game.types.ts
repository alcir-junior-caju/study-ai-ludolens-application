export interface GameManual {
  id: string
  gameName: string
  fileName: string
  filePath: string
  uploadedAt: Date
  processedAt?: Date
  isProcessed: boolean
}

export interface GameQuery {
  manualId: string
  imageUrl: string
  question: string
  response?: string
  timestamp: Date
}

export interface ProcessedDocument {
  manualId: string
  chunks: DocumentChunk[]
  embeddingsGenerated: boolean
}

export interface DocumentChunk {
  id: string
  content: string
  pageNumber?: number
  metadata: Record<string, any>
}
