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


const cleanHtml = (html) => {
  return html.replace(/<script.*>.*<\/script>/ims, '').replace(/<style.*>.*<\/style>/ims, '').replace(/<img[^>]*>/g,'').replace(/<(.|\n)*?>/ig, ' ').replace(/  /ig, '').replace(/\n/g,'|');
}


// ############################
// CRAWLER
// define the data handler function
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: process.env.CHUNK_SIZE || 1000,
  chunkOverlap: process.env.CHUNK_OVERLAP || 100,
});

const turnPageIntoVector = async (url, data) => {
  let text = cleanHtml(data);

  const docOutput = await splitter.splitDocuments([
    new Document({
      pageContent: text + ' fonte: ' + url,
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
