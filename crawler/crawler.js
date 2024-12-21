import axios from 'axios';
import * as cheerio from 'cheerio';

const normalizeUrl = (url, baseUrl) => {
  try {
    // create a URL object and use baseUrl for relative URLs
    const normalized = new URL(url, baseUrl);

    // remove trailing slash from the pathname, if present
    if (normalized.pathname.endsWith('/')) {
      normalized.pathname = normalized.pathname.slice(0, -1);
    }

    // return the normalized url as a lowercase string
    return normalized.href.toLowerCase();
  } catch (e) {
    console.error(`invalid url: ${url}`);
    return null;
  }
};

// define a crawler function
const crawler = async ({
  baseUrl,
  initialPage,
  allowedPagesToVisit, // if not set, will crawl all pages
  maxCrawlLength,
  maxConcurrency,
  dataHandler
}) => {
  const pagesQueue = [initialPage];

  // track visited URLs with a set
  const visitedUrls = new Set();

  // create a new axios instance
  const axiosInstance = axios.create();

  // helper function to crawl the next url
  const crawlNext = async () => {
    // stop crawling if queues are empty or crawl limit is reached
    if (
      pagesQueue.length === 0 ||
      visitedUrls.size >= maxCrawlLength
    ) {
      return;
    }

    let currentUrl = pagesQueue.shift();

    // normalize the URLs to an absolute path
    const normalizedUrl = normalizeUrl(currentUrl, baseUrl);
    if (!normalizedUrl || visitedUrls.has(normalizedUrl)) return;

    // update the visited URLs set
    visitedUrls.add(normalizedUrl);

    try {
      // request the target URL with the Axios instance
      const response = await axiosInstance.get(normalizedUrl);
      // parse the website's html
      const $ = cheerio.load(response.data);

      const groupedLinks = [];

      if (allowedPagesToVisit) {
        allowedPagesToVisit.forEach(link => {
          groupedLinks.push($('a[href^="' + link + '"]'));
        });
      } else {
        groupedLinks.push($('a[href]'));
      }

      groupedLinks.forEach(linkElements => {
        linkElements.each((index, element) => {
          let url = $(element).attr('href');

          // normalize the URLs as they're crawled
          const absoluteUrl = normalizeUrl(url, baseUrl);

          // follow links within the target website
          if (
            absoluteUrl &&
            absoluteUrl.startsWith(baseUrl) &&
            !visitedUrls.has(absoluteUrl) &&
            !pagesQueue.includes(absoluteUrl)
          ) {
            pagesQueue.push(absoluteUrl);
          }
        });
      });

      /////////////////////////////
      // CALL DATA HANDLER FUNCTION
      dataHandler(normalizedUrl, response.data);
    } catch (error) {
      console.error(`error fetching ${currentUrl}: ${error.message}`);
    }
  };

  // manage concurrency by tracking active crawl promises
  const crawlWithConcurrency = async () => {
    const activePromises = new Set();

    // continue crawling as long as there are URLs and crawl limit is not reached
    for (
      ;
      pagesQueue.length > 0 &&
      visitedUrls.size < maxCrawlLength;
    ) {
      // check if active promises are below max concurrency limit
      if (activePromises.size < maxConcurrency) {
        const crawlPromise = crawlNext().finally(() =>
          activePromises.delete(crawlPromise)
        );
        activePromises.add(crawlPromise);
      }
      // wait for any of the active promises to resolve
      await Promise.race(activePromises);
    }
    // ensure all ongoing crawls are finished
    await Promise.allSettled(activePromises);
  };

  await crawlWithConcurrency();

  console.log('Crawling completed!');
};

export default crawler;

/** Based on: https://www.zenrows.com/blog/javascript-web-crawler-nodejs */
