# Ludolens Backend

API REST para processamento de manuais de jogos de mesa e consultas via IA.

## 🚀 Desenvolvimento

```bash
# Na raiz do monorepo
yarn install

# Configurar variáveis de ambiente
cp apps/backend/.env.example apps/backend/.env
# Editar e adicionar GOOGLE_API_KEY e DATABASE_URL

# Configurar banco de dados
cd apps/backend
yarn db:migrate

# Executar apenas o backend
cd ../..
yarn turbo run dev --filter=@ludolens/backend

# Ou dentro de apps/backend
cd apps/backend
yarn dev
```

Acesse: http://localhost:3000

## 📁 Estrutura

```
src/
├── controllers/         # HTTP handlers
│   ├── manual.controller.ts
│   └── query.controller.ts
├── services/           # Business logic
│   ├── pdf.service.ts
│   ├── embeddings.service.ts
│   └── manual.service.ts
├── agents/             # AI agents
│   └── rule-agent.ts
├── infra/              # Infrastructure
│   ├── config.ts
│   ├── storage.ts
│   ├── logger.ts
│   └── openapi.ts
├── routes/             # API routes
│   ├── manual.routes.ts
│   └── query.routes.ts
└── types/              # TypeScript types
    ├── game.types.ts
    └── api.types.ts
```

## 🛠️ Stack

- **Hono** - Web framework
- **LangChain** - AI orchestration
- **Google Gemini** - Multimodal AI
- **PostgreSQL + pgvector** - Vector store
- **pdf-parse** - PDF extraction
- **Pino** - Logging
- **Zod** - Validation

## 📚 API

Documentação interativa: http://localhost:3000/docs

### Endpoints principais:

- `POST /manuals` - Upload de PDF
- `GET /manuals` - Lista manuais
- `GET /manuals/:id` - Busca manual
- `DELETE /manuals/:id` - Remove manual
- `POST /query` - Consulta multimodal (imagem + texto)
- `POST /query/text` - Consulta apenas texto

## 🗄️ Migrations

```bash
# Executar todas as migrations
yarn db:migrate

# Executar migration específica
yarn db:migrate:specific -- 001_create_vector_store.sql
```

## 📦 Build

```bash
# Build para produção
yarn build

# Executar build
yarn start
```

Outputs em `dist/`

## 🔑 Variáveis de Ambiente

```bash
GOOGLE_API_KEY=your_key_here
DATABASE_URL=postgresql://user:pass@host:5432/ludolens
PORT=3000
NODE_ENV=development
```
