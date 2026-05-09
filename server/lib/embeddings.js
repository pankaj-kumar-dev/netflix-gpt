const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

// Gemini text-embedding-004: 768 dimensions (vs OpenAI's 1536)
// Free tier, no quota issues
const generateEmbedding = async (text) => {
  const result = await embeddingModel.embedContent(text.slice(0, 8000));
  return result.embedding.values; // float[]
};

// Cosine similarity: measures angle between two vectors (range: -1 to 1)
// 1.0 = identical meaning, 0 = unrelated
const cosineSimilarity = (a, b) => {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

const findTopN = (queryEmbedding, corpus, n = 5) => {
  return corpus
    .map((item) => ({
      ...item,
      score: cosineSimilarity(queryEmbedding, item.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
};

const buildMovieText = (movie) => {
  const parts = [
    movie.title,
    movie.tagline,
    movie.overview,
    movie.genres?.map((g) => g.name).join(", "),
    movie.keywords?.keywords?.map((k) => k.name).join(", "),
  ].filter(Boolean);
  return parts.join(". ");
};

module.exports = { generateEmbedding, cosineSimilarity, findTopN, buildMovieText };
