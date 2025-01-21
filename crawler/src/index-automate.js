// Node imports
import readline from 'node:readline';
import chalk from 'chalk';
import fs from "node:fs";
import { parse, transform, stringify } from 'csv';


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
//// ASSISTANT TEST AUTOMATION
fs.createReadStream(`${process.cwd()}/data/questions.csv`)
  .pipe(parse({ delimiter: ',', from_line: 1, columns: true }))
  .on('data', async function (row) {

    let result = await assistant.invoke({
      input: row.Question,
    });

    console.log(result);
  });



