// Node imports
import readline from 'node:readline';
import chalk from 'chalk';

// Custom imports
import crawler from './crawler.js';
import assistant from './assistant.js';
import turnPageIntoVector from './vector-store/page-handling.js';


// Initialize basic environment variables
const baseUrl = process.env.SITE_BASE_URL;
const initialPage = process.env.SITE_INITIAL_PAGE;
const allowedPagesToVisit = process.env.SITE_ALLOWED_PAGES !== '' ? process.env.SITE_ALLOWED_PAGES.split(',').map(i => i.trim()) : null;
const maxCrawlLength = process.env.MAX_CRAWL_NUM_PAGES || 10;
const maxConcurrency = process.env.MAX_CONCURRENT_REQUESTS || 2;


// ############################
// CRAWLER
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

    result = await assistant.invoke({
      input: userInput,
    });

    console.log(result);
    waitForUserInput();
  });
};
waitForUserInput();
