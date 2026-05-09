const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// text-embedding-3-small: 1536 dimensions, cheap, fast, good quality
const generateEmbedding = async (text) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000), // model token limit safety
  });
  return response.data[0].embedding; // float[]
};

// Cosine similarity: measures angle between two vectors (range: -1 to 1)
// 1.0 = identical meaning, 0 = unrelated, -1 = opposite meaning
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

// Given a query embedding, rank corpus items by similarity and return top N
const findTopN = (queryEmbedding, corpus, n = 5) => {
  return corpus
    .map((item) => ({
      ...item,
      score: cosineSimilarity(queryEmbedding, item.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
};

// Build a rich text representation of a movie for embedding
// More context = better semantic placement in embedding space
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
