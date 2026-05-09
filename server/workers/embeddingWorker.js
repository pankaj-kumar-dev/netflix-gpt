// Embedding worker — processes queued embedding jobs asynchronously.
// Runs alongside Express in the same process.
// Concurrency 2: process 2 movies simultaneously, respect OpenAI rate limits.

if (!process.env.REDIS_URL) {
  console.log("Redis not configured — embedding worker disabled");
  module.exports = null;
  return;
}

require("dotenv").config();
const { Worker } = require("bullmq");
const axios = require("axios");
const prisma = require("../lib/prisma");
const { generateEmbedding, buildMovieText } = require("../lib/embeddings");

const TMDB_BASE = "https://api.themoviedb.org/3";
const tmdbHeaders = () => ({
  Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
  accept: "application/json",
});

const worker = new Worker(
  "embeddings",
  async (job) => {
    const { movieId } = job.data;

    const existing = await prisma.movieEmbedding.findUnique({
      where: { movieId: Number(movieId) },
    });
    if (existing) return { cached: true, movieId };

    const [movie, keywordsData] = await Promise.all([
      axios.get(`${TMDB_BASE}/movie/${movieId}`, { headers: tmdbHeaders() }).then((r) => r.data),
      axios
        .get(`${TMDB_BASE}/movie/${movieId}/keywords`, { headers: tmdbHeaders() })
        .then((r) => r.data)
        .catch(() => ({ keywords: [] })),
    ]);

    const text = buildMovieText({ ...movie, keywords: keywordsData });
    const embedding = await generateEmbedding(text);

    await prisma.movieEmbedding.create({
      data: {
        movieId: movie.id,
        title: movie.title,
        overview: movie.overview ?? "",
        genres: movie.genres?.map((g) => g.name) ?? [],
        embedding,
      },
    });

    return { success: true, movieId: movie.id, title: movie.title };
  },
  {
    connection: { url: process.env.REDIS_URL },
    concurrency: 2,
  }
);

worker.on("completed", (job, result) => {
  if (!result.cached) {
    console.log(`[embedding] ✓ ${result.title} (${result.movieId})`);
  }
});

worker.on("failed", (job, err) => {
  console.error(`[embedding] ✗ job ${job?.id} failed: ${err.message}`);
});

module.exports = worker;
