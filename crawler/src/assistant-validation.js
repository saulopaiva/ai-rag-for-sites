
import { ChatOpenAI } from '@langchain/openai';
import { tool } from "@langchain/core/tools";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

import vectorStore from './vector-store/memory-vector-store.js'; //'./vector-store/chroma-vector-store.js';

//// ############################
//// ASSISTANT SETUP

/**
 * Create a retriever tool from the vector store
 *
 * The retriever tool is a tool that allows the agent to search for documents in the vector store
 * based on the user input.
 *
 * Parameters:
 * - k: the number of documents to retrieve
 * - searchType: the type of search to perform (mmr, bm25, etc)
 * - verbose: whether to print debug information
 * - searchKwargs: the search parameters (fetchK, lambda, etc)
 *    - fetchK: an intermediate number of results to fetch before applying further filtering or ranking.
 *    - lambda: the trade-off between relevance and diversity. A value of 0.5 suggests an equal emphasis on both aspects.
 */
// const retriever = vectorStore.asRetriever({
//   k: 10,
//   searchType: 'mmr',
//   verbose: false,
//   searchKwargs: {
//     fetchK: 40,
//     lambda: 0.5
//   },
// });

// const tool = createRetrieverTool(retriever, {
//   name: 'search_latest_knowledge',
// });


const validationInstructions = `
Avalie as respostas do chatbot com base nos critérios de Relevância, Precisão e Clareza. Para cada pergunta, atribua uma nota de 1 a 5 para cada critério, sendo 1 a pior nota e 5 a melhor nota. Ao final, faça uma avaliação geral da resposta e adicione observações relevantes.

1. Relevância
O que é: Mede se a resposta está relacionada à pergunta feita e atende à intenção do usuário.

Foco: Pertinência e utilidade.
Pergunta: "O chatbot entendeu a pergunta e respondeu dentro do contexto?"
Exemplo:
Pergunta: "Quais pacotes incluem passeios guiados?"
Resposta Relevante: "Os pacotes para Salvador e Gramado incluem passeios guiados."
Resposta Irrelevante: "Você pode conferir nossos pacotes no site."
Erros Comuns em Relevância:

Responder algo genérico ou fora do contexto.
Ignorar palavras-chave ou intenções claras na pergunta.

2. Precisão
O que é: Avalia se a resposta está correta e baseada nos dados disponíveis na base de conhecimento.

Foco: Exatidão e factualidade.
Pergunta: "A resposta contém informações corretas e completas?"
Exemplo:
Pergunta: "O pacote para Fortaleza inclui café da manhã?"
Resposta Precisa: "Sim, o pacote para Fortaleza inclui café da manhã."
Resposta Imprecisa: "Não temos essa informação no momento." (se a informação está disponível no banco de dados).
Erros Comuns em Precisão:

Fornecer informações incorretas.
Responder parcialmente sem avisar que a resposta está incompleta.
Ignorar informações importantes que estão disponíveis.

3. Clareza
O que é: Mede se a resposta é fácil de entender, bem estruturada e comunicada de forma eficiente.

Foco: Linguagem e apresentação.
Pergunta: "A resposta está bem escrita e é compreensível para o usuário?"
Exemplo:
Pergunta: "O que está incluído no pacote para Gramado?"
Resposta Clara: "O pacote para Gramado inclui transporte, hospedagem e café da manhã."
Resposta Confusa: "Gramado tem transporte e também café da manhã com hospedagem dependendo do pacote."
Erros Comuns em Clareza:

Uso de linguagem ambígua ou jargões técnicos.
Respostas desorganizadas ou muito longas.
Falta de pontuação ou formatação que dificulte a leitura.
`;

const fakeTool = tool(
  async (input) => {
    return input;
  },
  {
    name: "fake",
    description: "do nothing",
  }
);


const chatModel = new ChatOpenAI({ model: process.env.MODEL_CHAT });

const prompt = ChatPromptTemplate.fromMessages([
  ['system', validationInstructions],
  // new MessagesPlaceholder('chat_history'),
  ['human', '{input}'],
  new MessagesPlaceholder('agent_scratchpad'),
]);

const agent = await createOpenAIFunctionsAgent({
  llm: chatModel,
  tools: [fakeTool],
  prompt,
});

const assistantValidation = new AgentExecutor({
  agent,
  tools: [fakeTool],
  returnIntermediateSteps: false,
});

export default assistantValidation;
