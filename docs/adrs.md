# Padrões Arquiteturais — ADRs

## ADR-001 — Arquitetura Monolítica

**Decisão:**
Utilizar arquitetura monolítica no MVP.

**Motivação:**
Simplicidade, rapidez de desenvolvimento e menor custo inicial.

**Consequências:**
Escalabilidade limitada inicialmente, aceitável para MVP.

---

## ADR-002 — Uso exclusivo do Gemini

**Decisão:**
Utilizar Gemini tanto para embeddings quanto para o agente.

**Motivação:**
Redução de complexidade e dependências externas.

**Consequências:**
Forte dependência de um único provedor de IA.

---

## ADR-003 — Uso do LangChain

**Decisão:**
LangChain como camada de orquestração do agente.

**Motivação:**
Facilita RAG, agentes e manutenção futura.

**Consequências:**
Curva de aprendizado inicial.
