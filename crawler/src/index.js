// Node imports
import readline from 'node:readline';
import chalk from 'chalk';

// Langchain imports
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Custom imports
import crawler from './crawler.js';
import agentExecutor from './assistant.js';
import vectorStore from './vector-store/memory-vector-store.js';
// import vectorStore from './vector-store/chroma-vector-store.js';


// Initialize basic environment variables
const baseUrl = process.env.SITE_BASE_URL;
const initialPage = process.env.SITE_INITIAL_PAGE;
const allowedPagesToVisit = process.env.SITE_ALLOWED_PAGES !== '' ? process.env.SITE_ALLOWED_PAGES.split(',').map(i => i.trim()) : null;
const maxCrawlLength = process.env.MAX_CRAWL_NUM_PAGES || 10;
const maxConcurrency = process.env.MAX_CONCURRENT_REQUESTS || 2;

const cleanHtml = (html) => {
  return html.replace(/<script.*>.*<\/script>/ims, '').replace(/<style.*>.*<\/style>/ims, '').replace(/<img[^>]*>/g,'').replace(/<(.|\n)*?>/ig, ' ').replace(/  /ig, '').replace(/__/ig, '').replace(/\n/g,'|').replace(/\|/g,'');
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
