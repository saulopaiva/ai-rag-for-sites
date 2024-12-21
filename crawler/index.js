import crawler from "./crawler.js";

// specify the url of the site to crawl
const baseUrl = 'https://voudetrip.com.br/';

// initial page to start crawling
const initialPage = 'https://voudetrip.com.br/destinos/';

// Only pages with this prefix will be visited
const allowedPagesToVisit = [
  '/viagens-para/',
  '/trip/',
];

// define the desired crawl limit
const maxCrawlLength = 5;

// set the number of concurrency
const maxConcurrency = 2;

// define the data handler function
const logPage = (url, data) => {
  console.log(url);
};

crawler({
  baseUrl,
  initialPage,
  allowedPagesToVisit,
  maxCrawlLength,
  maxConcurrency,
  dataHandler: logPage
});
