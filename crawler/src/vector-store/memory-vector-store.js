
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';


const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  // batchSize: process.env.BATCH_SIZE,
  model: process.env.MODEL_EMBEDDING,
});

const vectorStore = new MemoryVectorStore(embeddings);

export default vectorStore;
