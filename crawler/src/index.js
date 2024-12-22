import crawler from './crawler.js';

import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { createRetrieverTool } from "langchain/tools/retriever";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";



// Initialize basic environment variables
const baseUrl = process.env.SITE_BASE_URL;
const initialPage = process.env.SITE_INITIAL_PAGE;
const allowedPagesToVisit = process.env.SITE_ALLOWED_PAGES !== '' ? process.env.SITE_ALLOWED_PAGES.split(',').map(i => i.trim()) : null;
const maxCrawlLength = process.env.MAX_CRAWL_LENGTH || 10;
const maxConcurrency = process.env.MAX_CONCURRENT_REQUESTS || 2;




const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  batchSize: process.env.BATCH_SIZE,
  model: process.env.MODEL,
});

const vectorStore = new MemoryVectorStore(embeddings);




// define the data handler function
const logPage = async (url, data) => {
  console.log(url);

  const document = {
    pageContent: url,
    metadata: { source: url },
  };

  await vectorStore.addDocuments([document]);

  // convert data do markdown
  // 1. page parse: https://github.com/saulopaiva/ai-site-assistant-poc/blob/main/degreegurucrawler/degreegurucrawler/spiders/configurable.py#L64
  // 2. add to vectorstore https://js.langchain.com/docs/integrations/text_embedding/openai/
};

await crawler({
  baseUrl,
  initialPage,
  allowedPagesToVisit,
  maxCrawlLength,
  maxConcurrency,
  dataHandler: logPage
});




const retriever = vectorStore.asRetriever({
  k: 6,
  searchType: "mmr",
  searchKwargs: {
    fetchK: 20,
    lambda: 0.5
  },
  verbose: false
});

const tool = createRetrieverTool(retriever, {
  name: "search_latest_knowledge",
  description: "Realiza pesquisas e retorna informações gerais atualizadas a respeito das urls enviadas.",
});

const chatModel = new ChatOpenAI({ model: "gpt-4" });

const AGENT_SYSTEM_TEMPLATE = `
Responda em portugues`;

const prompt = ChatPromptTemplate.fromMessages([
  ["system", AGENT_SYSTEM_TEMPLATE],
  // new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

const agent = await createOpenAIFunctionsAgent({
  llm: chatModel,
  tools: [tool],
  prompt,
});

const agentExecutor = new AgentExecutor({
  agent,
  tools: [tool],
  // Set this if you want to receive all intermediate steps in the output of .invoke().
  returnIntermediateSteps: false,
});

const result = await agentExecutor.invoke({
  input: 'qual a url de angra?',
});

console.log(result);

// embedder();
