# CineAI — AI-Powered Movie Discovery Platform

> Started as a Netflix clone tutorial. Rebuilt into a full SaaS-grade AI platform.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-336791?logo=postgresql)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-BullMQ-DC382D?logo=redis)](https://redis.io)
[![OpenAI](https://img.shields.io/badge/OpenAI-Embeddings-412991?logo=openai)](https://openai.com)
[![Stripe](https://img.shields.io/badge/Stripe-Subscriptions-635BFF?logo=stripe)](https://stripe.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase)](https://firebase.google.com)

---

## What This Is

An AI-powered movie discovery platform with semantic search, personalized recommendations, and subscription billing. Built with a React frontend, Express backend, PostgreSQL via Prisma, Redis caching, and OpenAI embeddings.

**This is not a tutorial clone.** The original tutorial project was a frontend-only React app with hardcoded API keys, no backend, and a GPT search feature that was a UI stub with no actual functionality. That was Phase 0. This is the result of systematically rebuilding it into a production-grade architecture across 5 engineering phases.

---

## Features

| Feature | Tier | Description |
|---|---|---|
| Movie Browse | Free | Now Playing, Popular, Top Rated, Upcoming rows |
| AI Search | Free | Natural language search via OpenAI → TMDB lookup |
| For You Row | Free | Personalized row derived from your search history |
| Recent Searches | Free | Clickable chips from your search history |
| Watch History | Free | Tracks movies you interact with |
| Semantic Search | **Pro** | Embedding-based meaning search — "films about obsession" works |
| Subscription Billing | — | Stripe-powered checkout and webhook handling |

---

## Architecture

```mermaid
graph TB
    subgraph Frontend ["React Frontend (CRA)"]
        UI[Browse / GPT Search / Auth]
    end

    subgraph Backend ["Express Server :5000"]
        MW[Auth + Rate Limit + Morgan]
        MR[/api/movies]
        AR[/api/ai]
        UR[/api/users]
        ER[/api/embeddings]
        BR[/api/billing]
    end

    subgraph Infra ["Infrastructure"]
        PG[(PostgreSQL\nPrisma ORM)]
        RD[(Redis\nCache + BullMQ)]
        WK[Embedding Worker\nBullMQ concurrency 2]
    end

    subgraph External ["External APIs"]
        TMDB[TMDB API]
        OAI[OpenAI\nGPT-4o-mini + Embeddings]
        STR[Stripe\nCheckout + Webhooks]
        FB[Firebase\nAuth]
    end

    UI -->|fetch /api/*| MW
    FB -->|onAuthStateChanged| UI
    MW --> MR & AR & UR & ER & BR
    MR -->|Redis cache 1hr| RD
    MR --> TMDB
    AR --> OAI
    AR --> TMDB
    AR --> PG
    UR --> PG
    ER -->|queue job| RD
    ER -->|semantic search| PG
    BR --> STR
    BR --> PG
    RD --> WK
    WK --> OAI
    WK --> PG
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Redux Toolkit | Global state (movies, GPT results, auth, config) |
| React Router v6 | Routing with layout-based auth listener |
| Tailwind CSS | Styling |
| Firebase Auth | Authentication (client SDK) |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | API server |
| Prisma | Type-safe ORM, schema-as-code migrations |
| PostgreSQL | Primary database (Neon recommended) |
| Redis | TMDB response caching + BullMQ job storage |
| BullMQ | Async background job queue for embedding generation |
| Firebase Admin SDK | Cryptographic token verification |

### AI / ML
| Technology | Purpose |
|---|---|
| OpenAI GPT-4o-mini | Movie title suggestions from natural language |
| OpenAI text-embedding-3-small | 1536-dim semantic embeddings per movie |
| Cosine similarity | Semantic search — angle between embedding vectors |

### SaaS
| Technology | Purpose |
|---|---|
| Stripe | Subscription billing, hosted checkout, webhooks |

---

## Engineering Decisions

### Why a backend proxy? (Phase 1)
All external API calls (TMDB, OpenAI) happen server-side. The browser never holds any API key. This prevents credential theft via DevTools, enables rate limiting, and positions the cache layer (Phase 2) between the client and external APIs.

### Why Redis caching on TMDB routes? (Phase 2)
Movie listings don't change every minute. A 1-hour TTL means a popular endpoint like `/api/movies/popular` hits TMDB once per hour regardless of how many users request it. Direct API cost reduction at zero complexity cost.

### Why BullMQ for embeddings? (Phase 5)
Embedding generation via OpenAI takes 300–800ms. Without a queue, 10 movie cards loading simultaneously = 10 concurrent blocking OpenAI calls on the request path. BullMQ moves these off the HTTP thread: the request returns `{ queued: true }` instantly and a worker processes them async at concurrency 2, respecting OpenAI rate limits.

### Why `Json` for embeddings instead of pgvector? (Phase 4)
pgvector requires a PostgreSQL extension and raw SQL through Prisma's `Unsupported()` type, adding setup friction without changing the algorithmic approach. Cosine similarity over `Json float[]` demonstrates the same concept. When you need to search across millions of movies, the upgrade path is one column type change + move the `ORDER BY` into a SQL `<=>` operator — no logic change.

### Why two GPT calls for personalized recommendations? (Phase 3)
A single prompt `"recommend movies for this user"` produces generic results. Splitting into two calls — (1) extract preference profile from search history, (2) recommend movies given that profile — gives GPT the context it needs to reason about the user's taste before making suggestions. Better output at the cost of one extra ~300ms roundtrip.

### Why feature-gate semantic search behind Pro? (Phase 5)
Each semantic search costs: 1 OpenAI embedding API call + N DB reads + N TMDB calls. This is materially more expensive than a TMDB cache hit. Subscription gating protects the cost baseline and creates a real upgrade incentive.

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database ([Neon](https://neon.tech) free tier works)
- Redis instance ([Upstash](https://upstash.com) free tier works)
- OpenAI API key
- TMDB API key (Bearer token)
- Firebase project
- Stripe account (for billing features)

### 1. Clone and install

```bash
git clone <repo-url>
cd netflix-gpt

# Frontend dependencies
npm install

# Backend dependencies
cd server && npm install
```

### 2. Environment variables

**Frontend** — copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

**Backend** — copy `server/.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```

Fill in the values. At minimum you need:
- `REACT_APP_FIREBASE_*` (frontend)
- `TMDB_TOKEN` (backend)
- `DATABASE_URL` (backend)

Everything else enables additional features progressively.

### 3. Database setup

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run

```bash
# From project root — starts both frontend and backend
npm run dev
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:5000`  
Health check: `http://localhost:5000/health`

---

## API Reference

### Movies
```
GET  /api/movies/now-playing     → Now playing (Redis cached)
GET  /api/movies/popular         → Popular movies (Redis cached)
GET  /api/movies/top-rated       → Top rated (Redis cached)
GET  /api/movies/upcoming        → Upcoming (Redis cached)
GET  /api/movies/videos/:id      → Movie trailer videos (Redis cached)
GET  /api/movies/search?q=       → TMDB search (not cached)
```

### AI
```
POST /api/ai/search              → GPT movie suggestions + TMDB enrichment
POST /api/ai/recommendations     → Personalized recs from search history
```

### Users
```
POST /api/users/sync             → Upsert user in DB on login
POST /api/users/watch            → Log movie view (upsert)
GET  /api/users/search-history   → Last 10 searches
```

### Embeddings
```
POST /api/embeddings/generate          → Embed movie + store (queued)
GET  /api/embeddings/similar/:movieId  → Cosine similarity search
POST /api/embeddings/semantic-search   → Embed query → match movies [PRO]
```

### Billing
```
POST /api/billing/create-checkout  → Stripe checkout session
POST /api/billing/webhook          → Stripe event handler
GET  /api/billing/status           → User's subscription tier
```

### Health
```
GET  /health  → DB + Redis connection status
```

---

## Activating Features

| Feature | Requires |
|---|---|
| Browse + Auth | Firebase config (frontend `.env`) |
| Movie data | `TMDB_TOKEN` (backend `.env`) |
| AI Search | `OPENAI_API_KEY` + `DATABASE_URL` |
| Redis caching | `REDIS_URL` |
| Personalization | `DATABASE_URL` + `OPENAI_API_KEY` + at least 2 searches |
| Semantic Search | `DATABASE_URL` + `OPENAI_API_KEY` + movies browsed |
| Async embedding | `REDIS_URL` (BullMQ uses Redis) |
| Subscription billing | `STRIPE_SECRET_KEY` + `STRIPE_PRO_PRICE_ID` + `STRIPE_WEBHOOK_SECRET` |
| Prod auth security | `FIREBASE_SERVICE_ACCOUNT_KEY` |

---

## Project Structure

```
netflix-gpt/
├── src/                          # React frontend
│   ├── app/
│   ├── components/
│   │   ├── common/               # Header, ProtectedRoute, UpgradeModal
│   │   ├── AuthListener.js       # Auth state + navigation (layout route)
│   │   ├── Browse.js
│   │   ├── GptSearchPage.js      # AI Search + Semantic Search modes
│   │   └── ...
│   ├── Hooks/                    # Data fetching + AI hooks
│   │   ├── usePersonalizedRecs.js
│   │   ├── useEmbeddingSearch.js
│   │   ├── useEmbedMovies.js
│   │   ├── useSubscription.js
│   │   └── ...
│   ├── services/
│   │   └── tmdb.js               # Frontend API client (calls backend)
│   └── utils/                    # Redux slices, Firebase, constants
│
└── server/                       # Express backend
    ├── routes/
    │   ├── movies.js             # TMDB proxy + Redis cache
    │   ├── ai.js                 # OpenAI proxy + history save
    │   ├── users.js              # User sync, watch + search history
    │   ├── embeddings.js         # Generate, similar, semantic-search
    │   └── billing.js            # Stripe checkout + webhook
    ├── middleware/
    │   ├── requireAuth.js        # Firebase token verification
    │   └── requirePro.js         # Subscription gate
    ├── lib/
    │   ├── prisma.js             # Singleton Prisma client
    │   ├── redis.js              # Redis with graceful degradation
    │   └── embeddings.js         # generateEmbedding, cosineSimilarity, findTopN
    ├── queues/
    │   └── index.js              # BullMQ queue definitions
    ├── workers/
    │   └── embeddingWorker.js    # Processes embedding jobs async
    └── prisma/
        └── schema.prisma         # User, SearchHistory, WatchHistory, MovieEmbedding
```

---

## Development Phases

| Phase | What | Engineering Concept |
|---|---|---|
| 0 | Security, routing, auth, Redux fixes | Foundation repair — no features on broken ground |
| 1 | Express backend + API proxy | Keys off the client, rate limiting, proxy layer |
| 2 | PostgreSQL + Prisma + Redis + user data | Persistent state, caching, data layer |
| 3 | Personalization engine | Two-call GPT chain, preference extraction, watch signals |
| 4 | Embeddings + semantic search | Vector representation, cosine similarity, meaning-based retrieval |
| 5 | Stripe + BullMQ + observability | Subscription billing, async job queues, production monitoring |
