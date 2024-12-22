import crawler from "./crawler.js";

// specify the url of the site to crawl
const baseUrl = process.env.SITE_BASE_URL;

// initial page to start crawling
const initialPage = process.env.SITE_INITIAL_PAGE;

// Only pages with this prefix will be visited
const allowedPagesToVisit = process.env.SITE_ALLOWED_PAGES.split(',').map(i => i.trim());

// define the desired crawl limit
const maxCrawlLength = process.env.MAX_CRAWL_LENGTH;

// set the number of concurrency
const maxConcurrency = process.env.MAX_CONCURRENT_REQUESTS;

// define the data handler function
const logPage = (url, data) => {
  console.log(url);
  // convert data do markdown
  // 1. page parse: https://github.com/saulopaiva/ai-site-assistant-poc/blob/main/degreegurucrawler/degreegurucrawler/spiders/configurable.py#L64
  // 2. add to vectorstore https://js.langchain.com/docs/integrations/text_embedding/openai/
};

crawler({
  baseUrl,
  initialPage,
  allowedPagesToVisit,
  maxCrawlLength,
  maxConcurrency,
  dataHandler: logPage
});
