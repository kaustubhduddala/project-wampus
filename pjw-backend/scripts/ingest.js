const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

dotenv.config();

const DATA_DIR = path.resolve(__dirname, '../data');
const BATCH_SIZE = 100;

function validateRequiredEnv() {
  const requiredKeys = [
    'OPENAI_API_KEY',
    'PINECONE_API_KEY',
    'PINECONE_INDEX_NAME',
  ];

  const missing = requiredKeys.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

async function readKnowledgeFiles() {
  const entries = await fs.readdir(DATA_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.txt'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

async function upsertBatch(index, records, totalRef) {
  if (records.length === 0) {
    return;
  }

  const batch = records.splice(0, records.length);
  await index.upsert({ records: batch });
  totalRef.count += batch.length;
  console.log(`Upserted batch of ${batch.length} records (${totalRef.count} total).`);
}

async function main() {
  validateRequiredEnv();

  const { RecursiveCharacterTextSplitter } = await import('@langchain/textsplitters');
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 350,
    chunkOverlap: 40,
  });

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

  const files = await readKnowledgeFiles();
  if (files.length === 0) {
    console.warn('No .txt files found in data directory. Nothing to ingest.');
    return;
  }

  const total = { count: 0 };
  const records = [];

  for (const fileName of files) {
    const filePath = path.join(DATA_DIR, fileName);
    const rawContent = await fs.readFile(filePath, 'utf8');
    const content = rawContent.trim();

    if (!content) {
      console.warn(`Skipping empty file: ${fileName}`);
      continue;
    }

    const chunks = await textSplitter.splitText(content);
    const filenameWithoutExtension = path.parse(fileName).name;

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
      const chunkText = chunks[chunkIndex].trim();
      if (!chunkText) {
        continue;
      }

      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunkText,
      });

      const embeddingVector = embeddingResponse?.data?.[0]?.embedding;
      if (!Array.isArray(embeddingVector)) {
        throw new Error(`Embedding generation failed for ${fileName} chunk ${chunkIndex}.`);
      }

      records.push({
        id: `${filenameWithoutExtension}-${chunkIndex}`,
        values: embeddingVector,
        metadata: {
          source: `${filenameWithoutExtension}.txt`,
          text: chunkText,
        },
      });

      if (records.length >= BATCH_SIZE) {
        await upsertBatch(index, records, total);
      }
    }
  }

  await upsertBatch(index, records, total);
  console.log(`Ingestion complete. Total vectors upserted: ${total.count}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Ingestion failed:', error);
    process.exit(1);
  });
