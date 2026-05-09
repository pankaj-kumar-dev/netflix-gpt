const express = require("express");
const axios = require("axios");
const router = express.Router();

const TMDB_BASE = "https://api.themoviedb.org/3";

const tmdbHeaders = () => ({
  Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
  accept: "application/json",
});

// Thin wrapper — all TMDB errors get forwarded to the global error handler
const tmdbGet = async (path) => {
  const { data } = await axios.get(`${TMDB_BASE}${path}`, {
    headers: tmdbHeaders(),
  });
  return data;
};

router.get("/now-playing", async (req, res, next) => {
  try {
    const data = await tmdbGet("/movie/now_playing?language=en-US&page=1");
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/popular", async (req, res, next) => {
  try {
    const data = await tmdbGet("/movie/popular");
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/top-rated", async (req, res, next) => {
  try {
    const data = await tmdbGet("/movie/top_rated");
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/upcoming", async (req, res, next) => {
  try {
    const data = await tmdbGet("/movie/upcoming");
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/videos/:movieId", async (req, res, next) => {
  try {
    const data = await tmdbGet(
      `/movie/${req.params.movieId}/videos?language=en-US`
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/search", async (req, res, next) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: "Query parameter q is required" });
  }
  try {
    const data = await tmdbGet(
      `/search/movie?query=${encodeURIComponent(q)}`
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
