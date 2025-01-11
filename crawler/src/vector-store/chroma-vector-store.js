
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { Chroma } from "@langchain/community/vectorstores/chroma";


const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  // batchSize: process.env.BATCH_SIZE,
  model: process.env.MODEL_EMBEDDING,
});

const vectorStore = new Chroma(embeddings, {
  collectionName: 'a-test-collection',
  url: 'http://localhost:8000', // Optional, will default to this value
  collectionMetadata: {
    'hnsw:space': 'cosine',
  }, // Optional, can be used to specify the distance method of the embedding space https://docs.trychroma.com/usage-guide#changing-the-distance-function
});

export default vectorStore;
