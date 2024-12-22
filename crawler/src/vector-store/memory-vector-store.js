
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { ChromaClient } from "chromadb";


const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  batchSize: process.env.BATCH_SIZE,
  model: process.env.MODEL,
});

const vectorStore = new MemoryVectorStore(embeddings);

export default vectorStore;
