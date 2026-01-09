# LudoLens 🎲 - Aplicação para fins de estudo no MBA em Engenharia de Software com IA

<div>
  <img alt="Criado por Alcir Junior [Caju]" src="https://img.shields.io/badge/criado%20por-Alcir Junior [Caju]-%23f08700">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-%23f08700">
</div>

---

## Descrição

Assistente IA para jogos de mesa que facilita consultas de regras em tempo real através de análise de fotos e manuais em PDF.

A aplicação foi desenvolvida com IA (VSCode + Copilot - Claude Sonnet 4.5) + Context7 como Tool, e com a pasta de `docs` com os documentos base para todo desenvolvimento.

---

## Visualizar o projeto na IDE:

Para quem quiser visualizar o projeto na IDE clique no teclado a tecla `ponto`, esse recurso do GitHub é bem bacana

---

## 📋 Prints

<p align="center">
  <img alt="GIF" src="_images/rodada.gif" width="75%" style="margin: 15px 0" />
</p>

<p align="center">
  <img alt="Tela 01" src="_images/tela-1.png" width="75%" style="margin: 15px 0" />
</p>

<p align="center">
  <img alt="Tela 02" src="_images/tela-2.png" width="75%" style="margin: 15px 0" />
</p>

---

## 📋 Documentação

> **Monorepo**: Este projeto utiliza Turborepo com Yarn Workspaces
> - `apps/backend` - API REST com Node.js + Hono
> - `apps/frontend` - Interface React + Vite

A documentação completa do projeto está em [`/docs`](./docs):
- [Contexto Geral](./docs/general-context.md) - Visão, problema e solução
- [Requisitos (PDR)](./docs/pdr.md) - Definição do produto
- [Stack Tecnológica](./docs/stack.md) - Tecnologias utilizadas
- [ADRs](./docs/adrs.md) - Decisões arquiteturais
- [Guidelines](./docs/guideline.md) - Padrões de código
- [Estado Atual](./docs/state.md) - Status do desenvolvimento

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 20.19+ ou 22.12+
- Yarn 1.22+
- PostgreSQL 14+ com extensão pgvector
- Chave API do Google Gemini ([Obter aqui](https://makersuite.google.com/app/apikey))

### Instalação

```bash
# Clonar e entrar no diretório
cd ludolens

# Instalar dependências (na raiz do monorepo)
yarn install

# Configurar variáveis de ambiente do backend
cp apps/backend/.env.example apps/backend/.env
# Editar apps/backend/.env e adicionar:
#   - GOOGLE_API_KEY (obrigatório)
#   - DATABASE_URL (obrigatório)

# Configurar banco de dados
cd apps/backend
yarn db:migrate
cd ../..

# Executar em desenvolvimento (backend + frontend)
yarn dev
```

- **Backend**: `http://localhost:3000`
- **Frontend**: `http://localhost:5173`
- **API Docs**: `http://localhost:3000/docs`

### Setup Rápido do Banco (Opção Docker)

```bash
# Iniciar PostgreSQL com pgvector
docker run -d \
  --name ludolens-postgres \
  -e POSTGRES_DB=ludolens \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  ankane/pgvector:latest

# Configurar .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ludolens

# Setup (executar dentro de apps/backend)
cd apps/backend
yarn db:migrate
cd ../..
```

## 📚 Documentação da API

Acesse a documentação interativa da API:
- **Scalar UI**: http://localhost:3000/docs
- **OpenAPI JSON**: http://localhost:3000/openapi.json
- **Exemplos de Uso**: [examples/API-EXAMPLES.md](./examples/API-EXAMPLES.md)

## 🏗️ Estrutura do Projeto

```
ludolens/
├── apps/
│   ├── backend/          # API REST Node.js + Hono
│   │   ├── src/
│   │   │   ├── controllers/    # Handlers HTTP
│   │   │   ├── services/       # Lógica de negócio
│   │   │   ├── agents/         # Agentes IA
│   │   │   ├── infra/          # Configuração
│   │   │   └── types/          # TypeScript types
│   │   ├── scripts/            # Scripts de migração
│   │   ├── migrations/         # Migrações SQL
│   │   └── uploads/            # PDFs enviados
│   └── frontend/         # App React + Vite
│       ├── src/
│       │   ├── components/     # Componentes UI
│       │   ├── pages/          # Páginas
│       │   └── lib/            # Utilitários
│       └── public/
├── docs/                 # Documentação
├── turbo.json           # Configuração Turborepo
└── package.json         # Root package (workspaces)
```

## 🎮 Interface Web

O frontend oferece uma interface simples e intuitiva para:

### Listagem de Manuais (`/manuals`)
- Visualiza todos os manuais cadastrados no sistema
- Exibe informações como nome do arquivo e data de upload
- Permite selecionar um manual para fazer consultas

### Consulta de Regras (`/manuals/:id/query`)
- Upload de foto da mesa de jogo (opcional)
- Campo de texto para perguntas sobre as regras
- Análise multimodal (imagem + texto) via Gemini
- Respostas contextualizadas baseadas no manual

> **Nota**: O cadastro de novos manuais ainda é feito via API REST (`POST /api/manuals`)

## 🎯 Funcionalidades

### Upload de Manual
```bash
POST /manuals
Content-Type: multipart/form-data

gameName: "Ticket to Ride"
file: manual.pdf
```

### Consulta com Imagem (Multimodal)
```bash
POST /query
Content-Type: multipart/form-data

manualId: "uuid-do-manual"
image: foto-mesa.jpg
question: "Posso colocar dois trens nesta rota?" (opcional)
```

### Consulta por Texto
```bash
POST /query/text
Content-Type: application/json

{
  "manualId": "uuid-do-manual",
  "question": "Como funciona o sistema de pontuação?"
}
```

### Gerenciar Manuais
- `GET /manuals` - Lista todos os manuais
- `GET /manuals/:id` - Busca manual por ID
- `DELETE /manuals/:id` - Remove manual

## 🛠️ Tecnologias

### Backend
- **Framework**: Hono (ultrarrápido, compatível com Edge)
- **IA**: Google Gemini 2.0 Flash (multimodal)
- **LangChain**: Orquestração de agentes e RAG
- **Embeddings**: Google text-embedding-004 (768 dimensões)
- **Vector Store**: PostgreSQL + pgvector (HNSW index)
- **PDF**: pdf-parse para extração de texto
- **Logs**: Pino (high-performance structured logging)
- **Validação**: Zod com OpenAPI
- **Documentação**: Scalar API Reference

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn UI (Radix UI + Tailwind CSS 4)
- **Routing**: React Router DOM
- **Icons**: Lucide React

### Monorepo
- **Tool**: Turborepo
- **Package Manager**: Yarn Workspaces

## 📝 Scripts Disponíveis

```bash
# Monorepo (raiz)
yarn dev            # Executar backend + frontend
yarn build          # Build de todos os apps
yarn lint           # Lint em todos os apps

# Backend (apps/backend)
cd apps/backend
yarn dev            # Desenvolvimento com watch mode
yarn build          # Compilar TypeScript
yarn start          # Executar build
yarn db:migrate     # Executar migrations

# Frontend (apps/frontend)
cd apps/frontend
yarn dev            # Servidor de desenvolvimento
yarn build          # Build para produção
yarn preview        # Preview do build
```

## 🔑 Variáveis de Ambiente

```bash
# Obrigatórias
GOOGLE_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://user:password@host:5432/ludolens

# Opcionais
PORT=3000
NODE_ENV=development
```

## 🧪 Exemplo de Uso

1. **Inicie o servidor**:
```bash
yarn dev
```

2. **Faça upload de um manual** (usando curl ou Scalar UI em /docs):
```bash
curl -X POST http://localhost:3000/manuals \
  -F "gameName=Catan" \
  -F "file=@catan-manual.pdf"
```

3. **Aguarde o processamento** (alguns segundos para extrair texto e gerar embeddings)

4. **Consulte uma regra**:
```bash
curl -X POST http://localhost:3000/query \
  -F "manualId=<id-retornado>" \
  -F "image=@foto-mesa.jpg" \
  -F "question=Posso construir aqui?"
```

## 🚦 Status do Projeto

✅ **MVP Backend Completo**

Todas as funcionalidades principais estão implementadas e funcionais. Veja [docs/state.md](./docs/state.md) para detalhes.

## 🔮 Próximos Passos

- [ ] Interface web para testes
- [ ] Autenticação e autorização
- [ ] Cache de respostas
- [ ] Testes automatizados
- [ ] Deploy em produção (Vercel + Supabase)
- [ ] Otimização de índices HNSW
- [ ] Monitoramento e observabilidade

## 📖 Documentação Adicional

- [Contexto Geral](./docs/general-context.md) - Visão do produto
- [Estado Atual](./docs/state.md) - Status do desenvolvimento

## 📄 Licença

ISC

---

**Desenvolvido com ❤️ para a comunidade de board games**
