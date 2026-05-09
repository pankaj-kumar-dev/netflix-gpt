const express = require("express");
const axios = require("axios");
const router = express.Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/requireAuth");
const requirePro = require("../middleware/requirePro");
const { generateEmbedding, findTopN, buildMovieText } = require("../lib/embeddings");
const { embeddingQueue } = require("../queues");

const TMDB_BASE = "https://api.themoviedb.org/3";
const tmdbHeaders = () => ({
  Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
  accept: "application/json",
});

const tmdbGet = (path) =>
  axios.get(`${TMDB_BASE}${path}`, { headers: tmdbHeaders() }).then((r) => r.data);

// POST /api/embeddings/generate { movieId }
// If BullMQ + Redis available: queues a job (instant response)
// If not: falls back to synchronous embedding (slower but works)
router.post("/generate", requireAuth, async (req, res, next) => {
  const { movieId } = req.body;
  if (!movieId) return res.status(400).json({ error: "movieId required" });

  try {
    const existing = await prisma.movieEmbedding.findUnique({
      where: { movieId: Number(movieId) },
    });
    if (existing) return res.json({ cached: true, movieId: existing.movieId });

    if (embeddingQueue) {
      // Queue the job — respond immediately, worker processes async
      await embeddingQueue.add("embed-movie", { movieId: Number(movieId) });
      return res.json({ queued: true, movieId: Number(movieId) });
    }

    // Fallback: synchronous embedding (no Redis)
    const [movie, keywordsData] = await Promise.all([
      tmdbGet(`/movie/${movieId}`),
      tmdbGet(`/movie/${movieId}/keywords`).catch(() => ({ keywords: [] })),
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

    res.json({ success: true, movieId: movie.id });
  } catch (err) {
    next(err);
  }
});

// GET /api/embeddings/similar/:movieId
router.get("/similar/:movieId", requireAuth, async (req, res, next) => {
  const movieId = Number(req.params.movieId);

  try {
    const source = await prisma.movieEmbedding.findUnique({ where: { movieId } });
    if (!source) {
      return res.json({ results: [], message: "Movie not embedded yet" });
    }

    const corpus = await prisma.movieEmbedding.findMany({
      where: { movieId: { not: movieId } },
    });

    if (!corpus.length) return res.json({ results: [], message: "No other movies indexed" });

    const similar = findTopN(source.embedding, corpus, 5);

    const enriched = await Promise.all(
      similar.map(async (m) => {
        const data = await tmdbGet(`/movie/${m.movieId}`).catch(() => null);
        return data ? { ...data, similarityScore: Number(m.score.toFixed(4)) } : null;
      })
    );

    res.json({ sourceTitle: source.title, results: enriched.filter(Boolean) });
  } catch (err) {
    next(err);
  }
});

// POST /api/embeddings/semantic-search { query }
// PRO only — gated by requirePro middleware
router.post("/semantic-search", requireAuth, requirePro, async (req, res, next) => {
  const { query } = req.body;
  if (!query?.trim()) return res.status(400).json({ error: "query required" });

  try {
    const queryEmbedding = await generateEmbedding(query.trim());
    const corpus = await prisma.movieEmbedding.findMany();

    if (!corpus.length) {
      return res.json({
        results: [],
        message: "Embedding index empty — browse movies first to build corpus",
      });
    }

    const similar = findTopN(queryEmbedding, corpus, 5);

    const enriched = await Promise.all(
      similar.map(async (m) => {
        const data = await tmdbGet(`/movie/${m.movieId}`).catch(() => null);
        return data ? { ...data, similarityScore: Number(m.score.toFixed(4)) } : null;
      })
    );

    res.json({ results: enriched.filter(Boolean) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
