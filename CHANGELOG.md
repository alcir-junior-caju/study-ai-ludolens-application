# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

---

## [Unreleased] - 2026-01-06

### 🎯 Vector Store Persistente (PostgreSQL + pgvector)

#### Adicionado
- ✅ **PostgreSQL + pgvector** como vector store persistente
- ✅ Migrado de in-memory para `PGVectorStore` (LangChain Community)
- ✅ Tabela `game_manuals_vectors`:
  - `id` (UUID), `content` (TEXT), `embedding` (vector(768))
  - `metadata` (JSONB), `created_at`, `updated_at` (TIMESTAMP)
- ✅ **Índice HNSW** para busca vetorial otimizada (m=16, ef_construction=64)
- ✅ **Índice B-tree** para filtros por `manualId` em metadata
- ✅ Trigger automático para atualizar `updated_at`

#### Dependências
- ➕ `pg` ^8.13.1 (PostgreSQL client)
- ➕ `pgvector` ^0.2.0 (suporte a vetores)
- ➕ `@types/pg` ^8.11.10 (tipos TypeScript)

#### Configuração
- ✅ Adicionado `DATABASE_URL` às variáveis de ambiente
- ✅ Validação obrigatória de `DATABASE_URL`
- ✅ Pool de conexões (max: 20, timeout: 2s, idle: 30s)

#### Scripts e Migrations
- ✅ `migrations/001_create_vector_store.sql` - Setup completo do banco
- ✅ `scripts/setup-database.ts` - Setup automatizado com verificações
- ✅ `yarn db:setup` - Comando para executar migrations

#### Documentação
- ✅ `docs/DEPLOY.md` - Guias de deploy completos:
  - Supabase, Neon, Railway, Docker local
  - Troubleshooting e otimizações
- ✅ README.md atualizado com setup do banco
- ✅ `docs/state.md` atualizado com nova arquitetura

#### Serviços Refatorados
- 🔄 `EmbeddingsService`:
  - Removida classe `SimpleVectorStore` (in-memory)
  - Implementada inicialização assíncrona de `PGVectorStore`
  - Métodos async: `removeManual()`, `isManualIndexed()`
  - Método `close()` para finalizar pool
  - Filtro por `manualId` em metadata nas buscas
- 🔄 `ManualService.deleteManual()` - Agora async

#### Melhorias
- 🚀 **Performance**: HNSW index = buscas muito mais rápidas
- 💾 **Persistência**: Vetores sobrevivem a reinicializações
- 🔍 **Filtros**: Suporte a JSONB em metadata
- 📊 **Escalabilidade**: Pronto para milhares de manuais
- 🛡️ **Confiabilidade**: Backup/restore nativo do PostgreSQL

#### Removido
- ❌ Classe `SimpleVectorStore` (implementação in-memory)
- ❌ Map `vectorStores` em memória no `EmbeddingsService`

---

## [1.0.0] - 2026-01-05

### 🎉 MVP Backend Completo

#### API REST
- ✅ Framework Hono (ultrarrápido, edge-compatible)
- ✅ OpenAPI 3.1 + Scalar UI (`/docs`)
- ✅ Endpoints completos: upload, CRUD, consultas

#### Upload e Processamento
- ✅ Upload de PDFs via multipart/form-data
- ✅ Extração de texto com pdf-parse
- ✅ Chunking com RecursiveCharacterTextSplitter (1000 chars, overlap 200)
- ✅ Processamento assíncrono em background

#### IA e Embeddings
- ✅ Google Gemini 2.0 Flash Exp (multimodal)
- ✅ Google text-embedding-004 (768 dimensões)
- ✅ Implementação custom `SimpleVectorStore` in-memory
- ✅ Similaridade de cosseno para busca vetorial

#### RAG (Retrieval-Augmented Generation)
- ✅ Busca de contexto relevante antes da geração
- ✅ Streaming de respostas do Gemini
- ✅ Suporte multimodal (texto + imagem)

#### Infraestrutura
- ✅ Logs estruturados com Pino
- ✅ File storage local
- ✅ Validação com Zod
- ✅ TypeScript strict mode

#### Correções de Lint
- ✅ Imports corretos do `@langchain/core`
- ✅ pdf-parse com `@ts-ignore` para ESM
- ✅ Método `stream()` do ChatGoogleGenerativeAI
- ✅ Propriedade `model` (não `modelName`)

#### Estrutura
```
src/
├── agents/           # Agente IA com Gemini
├── controllers/      # Handlers HTTP
├── infra/            # Config, storage, logger, openapi
├── services/         # PDF, embeddings, manual
├── types/            # TypeScript interfaces
└── index.ts          # Server Hono
```

#### Testes
- ✅ Compilação TypeScript OK
- ✅ Sem erros de lint
- ✅ Build completo em `dist/`

---

## Tipos de Mudanças
- `Adicionado` ➕ para novas funcionalidades
- `Modificado` 🔄 para mudanças em funcionalidades existentes
- `Depreciado` ⚠️ para funcionalidades que serão removidas
- `Removido` ❌ para funcionalidades removidas
- `Corrigido` 🐛 para correções de bugs
- `Segurança` 🔒 para vulnerabilidades corrigidas

4. Fazer upload de um PDF de teste
5. Testar consulta com imagem

## Comandos Úteis

```bash
# Iniciar servidor
yarn dev

# Compilar
yarn build

# Acessar docs
open http://localhost:3000/docs

# Verificar logs
# Os logs aparecem no console com Pino Pretty
```
