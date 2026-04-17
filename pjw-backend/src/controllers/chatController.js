const fs = require('fs/promises');
const path = require('path');
const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

const SYSTEM_MESSAGE_PATH = path.resolve(__dirname, '../../config/system_message.txt');

const aliasPatterns = [
  /\bproject\s*wampus\b/gi,
  /\bprojectwampus\b/gi,
  /\bpjwampus\b/gi,
  /\bpjw\b/gi,
  /\bpwc\b/gi,
];

function normalizeAliases(input) {
  return aliasPatterns.reduce(
    (normalized, pattern) => normalized.replace(pattern, 'Project Wampus'),
    input
  );
}

function isValidHistoryMessage(message) {
  return (
    message &&
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string'
  );
}

const askQuestion = async (req, res) => {
  const { question, history, k } = req.body || {};

  if (typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  if (question.length > 500) {
    return res.status(400).json({ error: 'Question must be 500 characters or fewer.' });
  }

  if (!Array.isArray(history)) {
    return res.status(400).json({ error: 'History must be an array.' });
  }

  const parsedK = Number.parseInt(String(k ?? ''), 10);
  const topK = Math.min(5, Math.max(1, Number.isNaN(parsedK) ? 3 : parsedK));

  const normalizedQuestion = normalizeAliases(question.trim());

  try {
    const openAiApiKey = process.env.OPENAI_API_KEY;
    const pineconeApiKey = process.env.PINECONE_API_KEY;
    const pineconeIndexName = process.env.PINECONE_INDEX_NAME;

    if (!openAiApiKey || !pineconeApiKey || !pineconeIndexName) {
      throw new Error('Missing chatbot environment variables.');
    }

    const openai = new OpenAI({ apiKey: openAiApiKey });
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: normalizedQuestion,
    });
    const questionVector = embeddingResponse.data[0].embedding;

    const pinecone = new Pinecone({ apiKey: pineconeApiKey });
    const index = pinecone.index(pineconeIndexName);
    const queryResponse = await index.query({
      vector: questionVector,
      topK: topK,
      includeMetadata: true,
    });
    const matches = Array.isArray(queryResponse.matches) ? queryResponse.matches : [];

    const contextBlock = matches
      .map((match) => {
        const source = typeof match?.metadata?.source === 'string'
          ? match.metadata.source
          : 'unknown';
        const text = typeof match?.metadata?.text === 'string'
          ? match.metadata.text
          : '';
        return `Source: ${source}\n${text}`.trim();
      })
      .join('\n\n');

    const systemMessage = await fs.readFile(SYSTEM_MESSAGE_PATH, 'utf8');
    const cappedHistory = history
      .slice(-10)
      .filter(isValidHistoryMessage)
      .map((message) => ({ role: message.role, content: message.content }));

    const messages = [
      { role: 'system', content: systemMessage },
      ...cappedHistory,
      {
        role: 'user',
        content: `Question: ${normalizedQuestion}\n\nContext:\n${contextBlock || 'No relevant context found.'}`,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0,
      max_tokens: 600,
    });

    const answerContent = completion?.choices?.[0]?.message?.content;
    const answer = typeof answerContent === 'string' && answerContent.trim()
      ? answerContent.trim()
      : 'I do not have enough context to answer that.';

    const sources = [...new Set(
      matches
        .map((match) => match?.metadata?.source)
        .filter((source) => typeof source === 'string' && source.length > 0)
    )].slice(0, 2);

    return res.json({ answer, sources });
  } catch (error) {
    console.error('Chat controller error:', error);
    return res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
};

module.exports = { askQuestion };
