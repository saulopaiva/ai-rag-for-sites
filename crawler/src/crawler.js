import axios from 'axios';
import chalk from 'chalk';
import * as cheerio from 'cheerio';


const pageFocusSelector = process.env.PAGE_FOCUS_SELECTOR && process.env.PAGE_FOCUS_SELECTOR !== '' ? process.env.PAGE_FOCUS_SELECTOR : null;
const selectorNotFoundBehabvior = process.env.SELECTOR_NOT_FOUND_BEHAVIOR && process.env.SELECTOR_NOT_FOUND_BEHAVIOR !== '' ? process.env.SELECTOR_NOT_FOUND_BEHAVIOR : 'full_page';

/**
 * Normalize the URL removing trailing slashes from the pathname
 *
 * @param {Object} param - Function parameters
 * @param {string} param.url - The URL to be normalized
 * @param {string} param.baseUrl - The Base URL of site
 * @returns {string}
 */
const normalizeUrl = ({url, baseUrl}) => {
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
    console.error(chalk.red(`invalid url: ${url}`));
    return null;
  }
};

/**
 * Filter the allowed URLs to be visited from the page
 *
 * @param {Object} param0 - Function parameters
 * @param {string} param0.baseUrl - The base URL of the site
 * @param {Set} param0.visitedUrls - The set of visited URLs
 * @param {Array} param0.pagesQueue - The queue of pages to be crawled
 * @param {Array} param0.allowedPagesToVisit - The allowed pages to be visited
 * @param {Object} param0.$ - The cheerio object
 * @returns {Array}
 */
const getNewAllowedLinks = ({baseUrl, visitedUrls, pagesQueue, allowedPagesToVisit, $}) => {
  const allowedLinkElements = [];
  const allowedUrls = [];

  try {
    if (allowedPagesToVisit) {
      allowedPagesToVisit.forEach(link => {
        allowedLinkElements.push($('a[href^="' + link + '"]'));
      });
    } else {
      allowedLinkElements.push($('a[href]'));
    }

    allowedLinkElements.forEach(linkElements => {
      linkElements.each((i, element) => {
        let url = $(element).attr('href');

        // normalize the URLs as they're crawled
        const absoluteUrl = normalizeUrl({url, baseUrl});

        // follow links within the target website
        if (
          absoluteUrl &&
          absoluteUrl.startsWith(baseUrl) &&
          !visitedUrls.has(absoluteUrl) &&
          !pagesQueue.includes(absoluteUrl)
        ) {
          allowedUrls.push(absoluteUrl);
        }
      });
    });
  } catch (e) {
    console.error(chalk.red('invalid page'));
    return allowedUrls;
  }

  return allowedUrls;
};

/**
 * Main crawler function
 *
 * @param {Object} param0 - Function parameters
 * @param {string} param0.baseUrl - The base URL of the site
 * @param {string} param0.initialPage - The initial page to start crawling
 * @param {Array} param0.allowedPagesToVisit - The allowed pages to be visited
 * @param {number} param0.maxCrawlLength - The maximum number of pages to crawl
 * @param {number} param0.maxConcurrency - The maximum number of concurrent requests
 * @param {Function} param0.dataHandler - The function to handle the crawled data
 * @returns {Promise}
 */
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
    const normalizedUrl = normalizeUrl({url: currentUrl, baseUrl});
    if (!normalizedUrl || visitedUrls.has(normalizedUrl)) return;

    // update the visited URLs set
    visitedUrls.add(normalizedUrl);

    console.log(chalk.cyan('Crawling page:'), normalizedUrl);

    try {
      // request the target URL with the Axios instance
      const response = await axiosInstance.get(normalizedUrl);
      // parse the website's html
      const $ = cheerio.load(response.data);

      // update pagesQueue with new allowed links
      pagesQueue.push(...getNewAllowedLinks({baseUrl, visitedUrls, pagesQueue, allowedPagesToVisit, $}));

      /////////////////////////////
      // CALL DATA HANDLER FUNCTION
      let pageHtml = response.data;
      if (pageFocusSelector) {
        let $page = $(pageFocusSelector)

        if (!$page.length) {
          if (selectorNotFoundBehabvior === 'full_page') {
            pageHtml = response.data;
          } else { // skip
            return;
          }
        }

        pageHtml = $page.html();
      }

      dataHandler(normalizedUrl, pageHtml);
      /////////////////////////////
    } catch (error) {
      console.error(chalk.red('error fetching:'), `${currentUrl}: ${error.message}`);
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

  console.time('#crawler time');
  console.log(chalk.cyanBright('==========================\nCrawling started!'));

  await crawlWithConcurrency();

  console.log(chalk.cyanBright('Crawling completed!\n=========================='));
  console.timeEnd('#crawler time');
};

export default crawler;

/** Based on: https://www.zenrows.com/blog/javascript-web-crawler-nodejs */
