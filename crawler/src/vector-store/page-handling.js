import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import vectorStore from './memory-vector-store.js'; //'./vector-store/chroma-vector-store.js';

const cleanHtml = (html) => {
  return html.replace(/<script.*>.*<\/script>/ims, '').replace(/<style.*>.*<\/style>/ims, '').replace(/<img[^>]*>/g,'').replace(/<(.|\n)*?>/ig, ' ').replace(/  /ig, '').replace(/__/ig, '').replace(/\n/g,'|').replace(/\|/g,'');
}

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

export default turnPageIntoVector;
