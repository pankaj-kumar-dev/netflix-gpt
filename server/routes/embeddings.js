const express = require("express");
const axios = require("axios");
const router = express.Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/requireAuth");
const { generateEmbedding, findTopN, buildMovieText } = require("../lib/embeddings");

const TMDB_BASE = "https://api.themoviedb.org/3";
const tmdbHeaders = () => ({
  Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
  accept: "application/json",
});

const tmdbGet = (path) =>
  axios.get(`${TMDB_BASE}${path}`, { headers: tmdbHeaders() }).then((r) => r.data);

// POST /api/embeddings/generate { movieId }
// Fetches movie details from TMDB, generates embedding, stores in DB
// Idempotent — skips if already embedded
router.post("/generate", requireAuth, async (req, res, next) => {
  const { movieId } = req.body;
  if (!movieId) return res.status(400).json({ error: "movieId required" });

  try {
    const existing = await prisma.movieEmbedding.findUnique({
      where: { movieId: Number(movieId) },
    });
    if (existing) return res.json({ cached: true, movieId: existing.movieId });

    // Fetch movie details + keywords for richer embedding context
    const [movie, keywordsData] = await Promise.all([
      tmdbGet(`/movie/${movieId}`),
      tmdbGet(`/movie/${movieId}/keywords`).catch(() => ({ keywords: [] })),
    ]);

    const movieWithKeywords = { ...movie, keywords: keywordsData };
    const text = buildMovieText(movieWithKeywords);
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

    res.json({ success: true, movieId: movie.id, title: movie.title });
  } catch (err) {
    next(err);
  }
});

// GET /api/embeddings/similar/:movieId
// Returns top 5 movies semantically closest to the given movie
router.get("/similar/:movieId", requireAuth, async (req, res, next) => {
  const movieId = Number(req.params.movieId);

  try {
    const source = await prisma.movieEmbedding.findUnique({
      where: { movieId },
    });

    if (!source) {
      return res.json({ results: [], message: "Movie not embedded yet — call /generate first" });
    }

    const corpus = await prisma.movieEmbedding.findMany({
      where: { movieId: { not: movieId } },
    });

    if (corpus.length === 0) {
      return res.json({ results: [], message: "No other movies in index yet" });
    }

    const similar = findTopN(source.embedding, corpus, 5);

    // Enrich with TMDB poster/metadata
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
// Embeds the query text and finds movies with semantically similar embeddings
// Different from GPT search: no keyword matching — pure meaning-based retrieval
router.post("/semantic-search", requireAuth, async (req, res, next) => {
  const { query } = req.body;
  if (!query?.trim()) return res.status(400).json({ error: "query required" });

  try {
    const queryEmbedding = await generateEmbedding(query.trim());

    const corpus = await prisma.movieEmbedding.findMany();

    if (corpus.length === 0) {
      return res.json({
        results: [],
        message: "Embedding index is empty — browse some movies first to build the corpus",
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
