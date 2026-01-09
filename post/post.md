# Insights de Engenharia de IA: Da Teoria à Prática com o Projeto LudoLens

Na engenharia de software com IA, a maior distância costuma ser entre o *paper* e o *yarn start*. Como transformamos teoria em código que funciona?

Para responder a essa pergunta durante meu MBA em Engenharia de Software com IA, decidi ir além da teoria e construir uma solução do zero: o **LudoLens**, um assistente de IA para jogadores de board games.

Mergulhar na construção de uma aplicação multimodal me trouxe alguns aprendizados fundamentais que vão muito além dos manuais:

* **🚀 Monorepo como Ferramenta Pedagógica:** Adotar um monorepo foi uma decisão estratégica para otimizar o ciclo de feedback entre front e back, forçando-nos a tratar a aplicação como um sistema coeso e, crucialmente, reduzir a sobrecarga cognitiva da equipe.

* **💡 O Pipeline de Dados é o Rei (Não Apenas o LLM):** A grande revelação de um sistema RAG (*Retrieval-Augmented Generation*) não está no LLM, mas no pipeline que o alimenta. O verdadeiro desafio — e o aprendizado mais valioso — está na orquestração dos dados: da análise de manuais em PDF à geração de embeddings e à recuperação vetorial eficiente. É essa engenharia que define a qualidade da resposta final.

* **🤖 Infraestrutura Vetorial é Inegociável:** Dominar a infraestrutura de dados vetoriais (como **PostgreSQL com pgvector**) é o rito de passagem do teórico ao prático. Não é opcional, pois é a base sobre a qual a inteligência da aplicação é construída, determinando diretamente a performance e a precisão de todo o sistema.

Compilei a arquitetura e o fluxo de dados do LudoLens em um infográfico para quem, como eu, pensa visualmente. Dê uma olhada nos bastidores do projeto. 👇

https://github.com/alcir-junior-caju/study-ai-ludolens-application

Para os engenheiros e devs por aqui: qual foi o aprendizado mais contraintuitivo que vocês tiveram ao implementar um pipeline de IA, seja com RAG ou outra arquitetura?

#EngenhariaDeSoftware #InteligenciaArtificial #AI #MBA #LearningInPublic
