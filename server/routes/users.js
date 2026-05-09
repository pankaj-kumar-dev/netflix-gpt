const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/requireAuth");

// Upsert user on every login
router.post("/sync", requireAuth, async (req, res, next) => {
  const { email, displayName, photoURL } = req.body;
  const firebaseUid = req.user.uid;

  try {
    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: { email, displayName, photoURL },
      create: { firebaseUid, email, displayName, photoURL },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Last 10 searches for current user
router.get("/search-history", requireAuth, async (req, res, next) => {
  const firebaseUid = req.user.uid;

  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        searches: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, query: true, movieNames: true, createdAt: true },
        },
      },
    });
    res.json(user?.searches ?? []);
  } catch (err) {
    next(err);
  }
});

// Log a movie view — upsert so rewatches just update the timestamp
router.post("/watch", requireAuth, async (req, res, next) => {
  const { movieId, title, posterPath } = req.body;
  const firebaseUid = req.user.uid;

  if (!movieId || !title) {
    return res.status(400).json({ error: "movieId and title required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    await prisma.watchHistory.upsert({
      where: { userId_movieId: { userId: user.id, movieId: Number(movieId) } },
      update: { watchedAt: new Date() },
      create: { userId: user.id, movieId: Number(movieId), title, posterPath },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
