const express = require("express");
const axios = require("axios");
const router = express.Router();
const cache = require("../lib/redis");

const TMDB_BASE = "https://api.themoviedb.org/3";
const CACHE_TTL = 60 * 60; // 1 hour

const tmdbHeaders = () => ({
  Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
  accept: "application/json",
});

const tmdbGet = async (path) => {
  const { data } = await axios.get(`${TMDB_BASE}${path}`, {
    headers: tmdbHeaders(),
  });
  return data;
};

// Wraps a TMDB call with Redis cache
const withCache = async (key, fetcher) => {
  const cached = await cache.get(key);
  if (cached) return JSON.parse(cached);
  const data = await fetcher();
  await cache.set(key, JSON.stringify(data), CACHE_TTL);
  return data;
};

router.get("/now-playing", async (req, res, next) => {
  try {
    const data = await withCache("movies:now-playing", () =>
      tmdbGet("/movie/now_playing?language=en-US&page=1")
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/popular", async (req, res, next) => {
  try {
    const data = await withCache("movies:popular", () =>
      tmdbGet("/movie/popular")
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/top-rated", async (req, res, next) => {
  try {
    const data = await withCache("movies:top-rated", () =>
      tmdbGet("/movie/top_rated")
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/upcoming", async (req, res, next) => {
  try {
    const data = await withCache("movies:upcoming", () =>
      tmdbGet("/movie/upcoming")
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/videos/:movieId", async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const data = await withCache(`movies:videos:${movieId}`, () =>
      tmdbGet(`/movie/${movieId}/videos?language=en-US`)
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/search", async (req, res, next) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Query param q is required" });
  try {
    // Search results not cached — queries are unique per user input
    const data = await tmdbGet(`/search/movie?query=${encodeURIComponent(q)}`);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
