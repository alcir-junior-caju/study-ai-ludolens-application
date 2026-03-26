import { config } from 'dotenv'
import { resolve } from 'path'

// __dirname relativo ao script → apps/backend/scripts, sobe 3 níveis para a raiz
const envPath = resolve(import.meta.dirname!, '..', '..', '..', '.env')
console.log('Carregando .env de:', envPath)
config({ path: envPath })

import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'

const apiKey = process.env.GOOGLE_API_KEY

console.log('GOOGLE_API_KEY definida:', !!apiKey)
console.log('Primeiros 8 chars:', apiKey?.slice(0, 8) ?? 'N/A')

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: apiKey || '',
  model: 'gemini-embedding-001',
  // @ts-ignore - outputDimensionality is supported by the API
  additionalModelRequestOptions: { outputDimensionality: 768 },
})

async function test() {
  try {
    console.log('\n--- Teste 1: texto simples ---')
    const result = await embeddings.embedQuery('Olá, este é um teste de embedding')
    console.log('Dimensões:', result.length)
    console.log('Primeiros 5 valores:', result.slice(0, 5))

    console.log('\n--- Teste 2: embedDocuments (batch) ---')
    const batch = await embeddings.embedDocuments([
      'Regra do jogo: cada jogador começa com 5 cartas.',
      'O tabuleiro tem 40 casas dispostas em formato circular.',
    ])
    console.log('Quantidade de vetores:', batch.length)
    batch.forEach((v, i) => {
      console.log(`  Vetor ${i}: dimensões=${v.length}, vazio=${v.length === 0}`)
    })

    console.log('\n✅ API funcionando corretamente!')
  } catch (error) {
    console.error('\n❌ Erro na API:', error)
  }
}

test()
