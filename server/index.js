require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const movieRoutes = require("./routes/movies");
const aiRoutes = require("./routes/ai");
const userRoutes = require("./routes/users");
const embeddingRoutes = require("./routes/embeddings");
const billingRoutes = require("./routes/billing");
const prisma = require("./lib/prisma");
const cache = require("./lib/redis");

// Start embedding worker (no-op if Redis not configured)
require("./workers/embeddingWorker");

const app = express();
const PORT = process.env.PORT || 5000;

// Request logging — "GET /api/movies/popular 200 45ms"
app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  })
);

// IMPORTANT: Stripe webhook must be mounted BEFORE express.json()
// Stripe verifies the raw request body — parsing it first breaks signature verification
app.post(
  "/api/billing/webhook",
  express.raw({ type: "application/json" }),
  billingRoutes.webhookHandler
);

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});
app.use("/api", apiLimiter);

app.use("/api/movies", movieRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", userRoutes);
app.use("/api/embeddings", embeddingRoutes);
app.use("/api/billing", billingRoutes);

// Health check with real service status — useful for deployment platforms
app.get("/health", async (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      db: "unknown",
      redis: cache.isAvailable() ? "connected" : "disconnected",
    },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.db = "connected";
  } catch {
    health.services.db = "disconnected";
    health.status = "degraded";
  }

  res.status(health.status === "ok" ? 200 : 503).json(health);
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} — ${err.message}`);
  res.status(status).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
