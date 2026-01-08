# Padrões e Guidelines (Node.js)

## Linguagem
- TypeScript obrigatório

## Estrutura
- Separação clara de responsabilidades:
  - Controllers (HTTP)
  - Services (regras de negócio)
  - IA / Agents
  - Infra / Adapters

## Boas Práticas
- Funções pequenas e coesas
- Tipagem explícita
- Variáveis sensíveis via .env
- Tratamento centralizado de erros
- Logs para chamadas de IA

## Qualidade
- Código legível
- Sem lógica de negócio em controllers
