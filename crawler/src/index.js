// Node imports
import readline from 'node:readline';
import chalk from 'chalk';

// Langchain imports
import { ChatOpenAI } from '@langchain/openai';
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createRetrieverTool } from "langchain/tools/retriever";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

// Custom imports
import crawler from './crawler.js';
import vectorStore from './vector-store/memory-vector-store.js';
// import vectorStore from './vector-store/chroma-vector-store.js';


// Initialize basic environment variables
const baseUrl = process.env.SITE_BASE_URL;
const initialPage = process.env.SITE_INITIAL_PAGE;
const allowedPagesToVisit = process.env.SITE_ALLOWED_PAGES !== '' ? process.env.SITE_ALLOWED_PAGES.split(',').map(i => i.trim()) : null;
const maxCrawlLength = process.env.MAX_CRAWL_NUM_PAGES || 10;
const maxConcurrency = process.env.MAX_CONCURRENT_REQUESTS || 2;


// ############################
// CRAWLER
// define the data handler function
const turnPageIntoVector = async (url, data) => {
  let text = data.replace(/<script.*>.*<\/script>/ims, '').replace(/<img[^>]*>/g,'').replace(/<(.|\n)*?>/ig, ' ').replace(/  /ig, '').replace(/\n/g,'|');

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: process.env.CHUNK_SIZE || 1000,
    chunkOverlap: process.env.CHUNK_OVERLAP || 100,
  });

  const docOutput = await splitter.splitDocuments([
    new Document({
      pageContent: text,
      metadata: { source: url }
    }),
  ]);

  await vectorStore.addDocuments(docOutput);
};

await crawler({
  baseUrl,
  initialPage,
  allowedPagesToVisit,
  maxCrawlLength,
  maxConcurrency,
  dataHandler: turnPageIntoVector
});


//// ############################
//// ASSISTANT SETUP
const retriever = vectorStore.asRetriever({
  k: 100,
  searchType: 'mmr',
  searchKwargs: {
    fetchK: 20,
    lambda: 0.5
  },
  verbose: false
});

const tool = createRetrieverTool(retriever, {
  name: 'search_latest_knowledge',
  description: 'esta é uma base de dados a respeito de viagens da empresa VouDeTrip, um site sobre pacotes de viagens, responda as perguntas do usuário',
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

const agentExecutor = new AgentExecutor({
  agent,
  tools: [tool],
  returnIntermediateSteps: false,
});


//// ############################
//// ASSISTANT TEST
let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const waitForUserInput = function() {
  rl.question(chalk.yellow('\nO que quer saber?\n'), async function(userInput) {
    if (userInput == 'exit'){
      rl.close();
      return;
    }

    let result = '';

    result = await agentExecutor.invoke({
      input: userInput,
    });

    console.log(result);
    waitForUserInput();
  });
};
waitForUserInput();
