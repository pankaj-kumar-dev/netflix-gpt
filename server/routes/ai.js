const express = require("express");
const axios = require("axios");
const OpenAI = require("openai");
const router = express.Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/requireAuth");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TMDB_BASE = "https://api.themoviedb.org/3";
const tmdbHeaders = () => ({
  Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
  accept: "application/json",
});

const tmdbSearch = async (name) => {
  const { data } = await axios.get(
    `${TMDB_BASE}/search/movie?query=${encodeURIComponent(name)}`,
    { headers: tmdbHeaders() }
  );
  return data.results;
};

const GPT_SEARCH_PROMPT = (query) =>
  `You are a movie recommendation expert. The user wants: "${query}".
Suggest exactly 5 movie titles that match the request.
Reply ONLY with a comma-separated list of movie titles. No explanations, no numbering, no extra text.
Example format: The Dark Knight, Inception, Interstellar, Memento, The Prestige`;

// POST /api/ai/search — GPT search with history save
router.post("/search", requireAuth, async (req, res, next) => {
  const { query } = req.body;

  if (!query || typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "query is required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: GPT_SEARCH_PROMPT(query.trim()) }],
    });

    const movieNames = completion.choices[0].message.content
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);

    const results = await Promise.all(movieNames.map(tmdbSearch));

    // Save to DB — fire and forget
    const firebaseUid = req.user.uid;
    prisma.user
      .findUnique({ where: { firebaseUid } })
      .then((user) => {
        if (!user) return;
        return prisma.searchHistory.create({
          data: { userId: user.id, query: query.trim(), movieNames },
        });
      })
      .catch((err) => console.error("Search history save failed:", err.message));

    res.json({ movieNames, results });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/recommendations — personalized picks based on user history
// Flow: search history → GPT extracts preferences → GPT recommends → TMDB enriches
router.post("/recommendations", requireAuth, async (req, res, next) => {
  const firebaseUid = req.user.uid;

  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        searches: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { query: true },
        },
      },
    });

    if (!user || user.searches.length < 2) {
      return res.json({ results: [], preferences: null });
    }

    const searchTerms = user.searches.map((s) => s.query);

    // Step 1: Extract preference profile from search history
    const prefCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Based on these movie searches by a user: "${searchTerms.join(", ")}"
Extract their top 3 movie genre or theme preferences.
Reply as a comma-separated list only. Example: sci-fi, psychological thriller, dark comedy`,
        },
      ],
    });

    const preferences = prefCompletion.choices[0].message.content.trim();

    // Step 2: Recommend movies based on preference profile
    const recCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `A user loves: ${preferences}.
Their recent searches: "${searchTerms.slice(0, 5).join('", "')}".
Suggest 5 movies they would love but are unlikely to have already seen.
Reply ONLY as comma-separated movie titles. No explanations.`,
        },
      ],
    });

    const movieNames = recCompletion.choices[0].message.content
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);

    // Step 3: Fetch TMDB data — take best match for each title
    const results = await Promise.all(
      movieNames.map(async (name) => {
        const hits = await tmdbSearch(name);
        return hits[0] ?? null;
      })
    );

    res.json({
      preferences,
      results: results.filter(Boolean),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
