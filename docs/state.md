# Estado Atual de Desenvolvimento

## Status
✅ MVP Backend Completo + PostgreSQL Vector Store

## Definições Concluídas
- Problema e solução
- Escopo do MVP
- Stack tecnológica
- Arquitetura
- Dependências principais
- Banco de dados vetorial (PostgreSQL + pgvector)

## Implementações Concluídas ✅
1. ✅ Estrutura inicial do projeto Node.js + TypeScript
2. ✅ Upload e ingestão de PDF (com extração de texto e chunking)
3. ✅ Geração de embeddings com Gemini (text-embedding-004, 768 dimensões)
4. ✅ Análise de imagens multimodal (Gemini 2.0 Flash)
5. ✅ Prompt base do agente com RAG (Retrieval-Augmented Generation)
6. ✅ API REST completa com Hono
7. ✅ Documentação OpenAPI + Scalar UI
8. ✅ Sistema de logs estruturado (Pino)
9. ✅ Gerenciamento de arquivos (FileStorage)
10. ✅ **Vector Store persistente (PostgreSQL + pgvector)**
11. ✅ **Migration system para banco de dados**
12. ✅ **Script de setup automatizado (`yarn db:setup`)**
13. ✅ **Índices HNSW para busca vetorial otimizada**
14. ✅ **Monorepo com Turborepo (apps/backend + apps/frontend)**
15. ✅ **Frontend React + Vite + Shadcn UI**
16. ✅ **Página de listagem de manuais**
17. ✅ **Página de consulta com upload de imagem**

## Arquitetura Implementada

### Camadas
- **Controllers**: Handlers HTTP (manual.controller.ts, query.controller.ts)
- **Services**: Lógica de negócio (pdf.service.ts, embeddings.service.ts, manual.service.ts)
- **Agents**: Agente IA com Gemini (rule-agent.ts)
- **Infra**: Configuração, storage, logs (config.ts, storage.ts, logger.ts, openapi.ts)
- **Types**: Interfaces TypeScript (game.types.ts, api.types.ts)

### Funcionalidades da API

#### Manuais
- `POST /manuals` - Upload de PDF
- `GET /manuals` - Lista todos os manuais
- `GET /manuals/:id` - Busca manual por ID
- `DELETE /manuals/:id` - Remove manual

#### Consultas
- `POST /query` - Análise com imagem + texto (multimodal)
- `POST /query/text` - Consulta apenas com texto

#### Documentação
- `GET /docs` - Interface Scalar para testar API
- `GET /openapi.json` - Especificação OpenAPI 3.1

## Tecnologias Utilizadas

### Backend
- **Framework**: Hono (web framework ultrarrápido)
- **IA**: Google Gemini 2.0 Flash + LangChain
- **Embeddings**: Google text-embedding-004 (768 dimensões)
- **Vector Store**: PostgreSQL 14+ com extensão pgvector
- **Índices Vetoriais**: HNSW (Hierarchical Navigable Small World)
- **PDF**: pdf-parse
- **Logs**: Pino (high-performance logger)
- **Validação**: Zod
- **Documentação**: OpenAPI 3.1 + Scalar

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **UI Components**: Shadcn UI (Radix UI + Tailwind CSS)
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React

### Monorepo
- **Tool**: Turborepo
- **Package Manager**: Yarn Workspaces

## Banco de Dados

### Tabela: `game_manuals_vectors`
```sql
- id: UUID (primary key)
- content: TEXT (conteúdo do chunk)
- embedding: vector(768) (vetor de embeddings)
- metadata: JSONB (manualId, pageNumber, etc)
- created_at, updated_at: TIMESTAMP
```

### Índices
- **HNSW Index** em `embedding` para busca por similaridade
- **B-tree Index** em `metadata->>'manualId'` para filtros rápidos
- **B-tree Index** em `created_at` para queries temporais

### Configuração
- Pool de conexões: 20 máx
- Timeout: 2s conexão, 30s idle
- Suporte para filtros JSONB em metadata

## Estrutura do Projeto
```
ludolens/
├── apps/
│   ├── backend/          # API REST Node.js + Hono
│   │   ├── src/          # Código fonte
│   │   ├── scripts/      # Scripts de migração
│   │   ├── migrations/   # Migrações SQL
│   │   └── uploads/      # PDFs enviados
│   └── frontend/         # App React + Vite
│       ├── src/
│       │   ├── components/  # Componentes UI
│       │   ├── pages/       # Páginas
│       │   └── lib/         # Utilitários
│       └── public/
├── docs/                 # Documentação
├── turbo.json           # Configuração Turborepo
└── package.json         # Root package (workspaces)
```

## Próximos Passos (Melhorias Futuras)
1. ✅ ~~Desenvolver interface web simples para testes~~ (Concluído)
2. Implementar persistência de manuais em tabela relacional
3. Adicionar autenticação/autorização
4. Implementar cache de respostas
5. Adicionar testes unitários e de integração
6. Deploy em produção (Vercel + Supabase/Neon)
7. Monitoramento e observabilidade
8. Otimização de parâmetros HNSW

## Como Executar

### Backend
```bash
# 1. Configurar variáveis de ambiente
cp apps/backend/.env.example apps/backend/.env
# Adicionar:
#   - GOOGLE_API_KEY
#   - DATABASE_URL

# 2. Instalar dependências (na raiz)
yarn install

# 3. Configurar banco de dados
cd apps/backend
yarn db:migrate

# 4. Executar backend
cd ../..
yarn turbo run dev --filter=@ludolens/backend

# 5. Acessar documentação da API
http://localhost:3000/docs
```

### Frontend
```bash
# 1. Executar frontend (em outro terminal)
yarn turbo run dev --filter=@ludolens/frontend

# 2. Acessar aplicação
http://localhost:5173
```

### Desenvolvimento Completo (Backend + Frontend)
```bash
# Executar todos os apps simultaneamente
yarn dev

# Backend: http://localhost:3000
# Frontend: http://localhost:5173
```
