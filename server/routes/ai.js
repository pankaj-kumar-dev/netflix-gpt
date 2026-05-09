const express = require("express");
const axios = require("axios");
const OpenAI = require("openai");
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TMDB_BASE = "https://api.themoviedb.org/3";
const tmdbHeaders = () => ({
  Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
  accept: "application/json",
});

const GPT_PROMPT = (query) =>
  `You are a movie recommendation expert. The user wants: "${query}".
Suggest exactly 5 movie titles that match the request.
Reply ONLY with a comma-separated list of movie titles. No explanations, no numbering, no extra text.
Example format: The Dark Knight, Inception, Interstellar, Memento, The Prestige`;

// POST /api/ai/search
// Body: { query: string }
// Returns: { movieNames: string[], results: TMDBMovie[][] }
router.post("/search", async (req, res, next) => {
  const { query } = req.body;

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ error: "query is required" });
  }

  try {
    // Step 1: Ask GPT for movie title suggestions
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: GPT_PROMPT(query.trim()) }],
    });

    const movieNames = completion.choices[0].message.content
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    // Step 2: Fetch TMDB data for each suggested title in parallel
    const results = await Promise.all(
      movieNames.map(async (name) => {
        const { data } = await axios.get(
          `${TMDB_BASE}/search/movie?query=${encodeURIComponent(name)}`,
          { headers: tmdbHeaders() }
        );
        return data.results;
      })
    );

    res.json({ movieNames, results });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
