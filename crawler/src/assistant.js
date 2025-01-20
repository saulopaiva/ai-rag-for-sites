
import { ChatOpenAI } from '@langchain/openai';
import { createRetrieverTool } from "langchain/tools/retriever";
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
const retriever = vectorStore.asRetriever({
  k: 10,
  searchType: 'mmr',
  verbose: false,
  searchKwargs: {
    fetchK: 40,
    lambda: 0.5
  },
});

const tool = createRetrieverTool(retriever, {
  name: 'search_latest_knowledge',
});

const chatModel = new ChatOpenAI({ model: process.env.MODEL_CHAT });

const prompt = ChatPromptTemplate.fromMessages([
  ['system', process.env.AGENT_SYSTEM_TEMPLATE],
  // new MessagesPlaceholder('chat_history'),
  ['human', '{input}'],
  new MessagesPlaceholder('agent_scratchpad'),
]);

const agent = await createOpenAIFunctionsAgent({
  llm: chatModel,
  tools: [tool],
  prompt,
});

const assistant = new AgentExecutor({
  agent,
  tools: [tool],
  returnIntermediateSteps: false,
});

export default assistant;
