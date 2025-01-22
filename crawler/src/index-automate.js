// Node imports
import readline from 'node:readline';
import chalk from 'chalk';
import fs from "node:fs";
import { parse, transform, stringify } from 'csv';


// Custom imports
import crawler from './crawler.js';
import assistant from './assistant.js';
import assistantValidation from './assistant-validation.js';
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


const stringToCsv = (string) => {
  return '"' + string.replace(/"/g, '\'').replace(/,/g, '\,') + '"'
}



const validationUserInput = `avalie este input e output com base nos criterios definidos. Responda no formato: Relevancia: X, Precisao: Y, Clareza: Z ----\n`;




const questions = JSON.parse(fs.readFileSync(`${process.cwd()}/data/questions.json`, 'utf-8'))
const csvFile = `${process.cwd()}/data/questions.csv`;
let fileString = 'Identifier,Question,Type,Expectation,Response,Relevance,Accuracy,Clarity,Final-Assessment,Observations';


function forEachPromise(items, fn) {
  return items.reduce(function (promise, item) {
    return promise.then(function () {
      return fn(item);
    });
  }, Promise.resolve());
}


function emitQuestion(question) {
  return new Promise((resolve, reject) => {
    console.log(chalk.green(`\nEnviando questão: ${question.id}`));

    process.nextTick(async () => {
      let questionResult = await assistant.invoke({
        input: question.question,
      });

      console.log(chalk.green(`Avaliando questão: ${question.id}`));

      let questionEvaluationResult = await assistantValidation.invoke({
        input: validationUserInput + "{input: " + question.question + ", output: " + questionResult.output + "}",
      });

      if (questionResult && questionResult.input && questionResult.output) {
        console.log(chalk.yellow(`\nQuestion: ${questionResult.input}`));
        console.log(chalk.blue(`Answer: ${questionResult.output}`));

        const jsonObject = {
          Identifier: question.id,
          Question: stringToCsv(question.question),
          Type: question.type,
          Expectation: '',
          Response: stringToCsv(questionResult.output),
          Relevance: 'x',
          Accuracy: 'y',
          Clarity: 'z',
          'Final-Assessment': 'K',
          Observations: stringToCsv(questionEvaluationResult.output),
        };

        fileString += '\n' +  Object.values(jsonObject).join(',')
      }

      resolve();
    })
  });
}

forEachPromise(questions, emitQuestion).then(() => {
  console.log('done');
  fs.writeFileSync(csvFile, fileString, 'utf8');
});




