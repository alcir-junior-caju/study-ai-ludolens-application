# Stack Tecnológica

## Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn UI (Radix UI + Tailwind CSS 4)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Styling**: Tailwind CSS 4 com variáveis CSS
- **Funcionalidades**:
  - Upload de imagens da mesa de jogo
  - Formulário de perguntas contextuais
  - Listagem de manuais disponíveis
  - Exibição de respostas do agente IA

Tecnologias:
- React 19
- Vite
- Shadcn UI
- React Router DOM
- Tailwind CSS 4

## Backend
- Node.js
- TypeScript
- LangChain (JavaScript)

## Inteligência Artificial
- Gemini
  - Geração de embeddings
  - Agente multimodal (texto + imagem)

## Armazenamento
- PDFs originais (file system - apps/backend/uploads)
- Vetores de embeddings (PostgreSQL + pgvector)

## Monorepo
- **Tool**: Turborepo
- **Package Manager**: Yarn Workspaces
- **Estrutura**:
  - `apps/backend` - API REST com Hono
  - `apps/frontend` - App React com Vite
