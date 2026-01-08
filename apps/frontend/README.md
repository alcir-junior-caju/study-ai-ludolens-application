# Ludolens Frontend

Interface web para consulta de regras de jogos de mesa via IA.

## 🚀 Desenvolvimento

```bash
# Na raiz do monorepo
yarn install

# Executar apenas o frontend
yarn turbo run dev --filter=@ludolens/frontend

# Ou dentro de apps/frontend
cd apps/frontend
yarn dev
```

Acesse: http://localhost:5173

## 📁 Estrutura

```
src/
├── components/
│   └── ui/              # Componentes UI (Shadcn)
│       ├── button.tsx
│       └── card.tsx
├── pages/
│   ├── ManualList.tsx   # Listagem de manuais
│   └── ManualQuery.tsx  # Consulta com imagem/texto
├── lib/
│   └── utils.ts         # Utilitários (cn, etc)
├── App.tsx              # Roteamento principal
├── main.tsx             # Entry point
└── index.css            # Estilos globais
```

## 🎨 Stack

- **React 19** + TypeScript
- **Vite** - Build tool
- **Shadcn UI** - Componentes (Radix + Tailwind)
- **React Router** - Navegação
- **Lucide** - Ícones
- **Tailwind CSS 4** - Styling

## 🔌 API

O frontend se comunica com o backend em `http://localhost:3000`:

- `GET /api/manuals` - Lista manuais
- `POST /api/query` - Envia consulta (multimodal)

Configure o proxy no `vite.config.ts` se necessário.

## 📦 Build

```bash
# Build para produção
yarn build

# Preview do build
yarn preview
```

Outputs em `dist/`
