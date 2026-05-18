# Project Structure

Dual-mode monorepo:
- `backend/` - Node.js + Express + SQLite (port 3000, local mode only)
- `frontend/` - React + Vite + Tailwind CSS (port 5173)
- `movies.db` - SQLite database auto-created in project root (local mode only)
- `supabase/` - Supabase migrations for cloud mode

# Startup

Use start scripts - they auto-install dependencies on first run:
- Linux/macOS: `./start.sh`
- Windows: `start.bat`

Or manually:
- Backend: `cd backend && node server.js`
- Frontend: `cd frontend && npm run dev`

Both servers bind to `0.0.0.0` for network access.

# Dual-Mode Architecture

Mode is selected at build time via `VITE_MILO_MODE` environment variable:

**Local mode** (default): SQLite + Ollama backend AI, single user
**Cloud mode**: Supabase (Postgres + Auth) + BYOK AI (browser-side LLM calls with user-supplied keys)

In cloud mode, frontend API clients (`movieApi.js`, `tvApi.js`, `assistantApi.js`) switch to direct Supabase/browser calls; backend is unused.

# Key Files

- `backend/server.js` - Main entry point (loads .env, binds to 0.0.0.0)
- `backend/database.js` - SQLite connection, schema init, auto-migration via `migrateDatabase()`
- `backend/routes/index.js` - All API routes (movies and TV)
- `backend/ollama-recommender.js` - AI recommendations using Ollama (local mode only)
- `frontend/src/api/movieApi.js` - API client switches between local/cloud modes
- `frontend/src/api/cloud.js` - Supabase client for cloud mode
- `frontend/src/api/assistantApi.js` - AI API client switches between local/cloud modes
- `frontend/src/utils/MovieContext.jsx` - State management via React Context
- `frontend/vite.config.js` - Vite proxy: `/api` -> `http://localhost:3000` (local mode)
- `scripts/migrate-sqlite-to-supabase.js` - Migrate local SQLite to Supabase (cloud mode)

# Database

**Local mode**: SQLite `movies.db` auto-created in project root. Schema: `id, title, rating (1-10), genre, date_watched, notes, director, release_year, type (movie/tv), num_seasons, total_episodes, created_at`. Single table with `type` column distinguishes movies/TV.

**Cloud mode**: Supabase Postgres with RLS scoped to `auth.uid() = user_id`. Schema in `supabase/migrations/0001_init.sql`.

Auto-migration on startup via `database.js:migrateDatabase()` handles schema changes automatically (local mode only).

# AI Recommendations

**Local mode**: Ollama at `http://localhost:11434` by default. Models are listed from `/api/ollama/models` (embedding models filtered out) and selected in UI per request—no hardcoded default. AI responses cached 24h per cache key (`contentType:type:model`). Gracefully degrades to fallback recommendations if Ollama unavailable.

**Cloud mode**: BYOK (Bring Your Own Key) - AI providers called directly from browser using user-supplied keys stored in `localStorage`. Providers in `frontend/src/ai/providers/`: OpenRouter (preferred), Anthropic direct, Ollama (user-supplied URL). Keys stored under `milo.aiSettings.v1`, never sent to Milo-controlled server.

# OLLAMA Configuration (Local Mode)

Configure in `backend/.env` (all have defaults):
- `OLLAMA_URL=http://localhost:11434`
- `OLLAMA_TIMEOUT_MS=480000` (8 min)
- `OLLAMA_MODELS_TIMEOUT_MS=30000` (30 sec)
- `OLLAMA_STATUS_TIMEOUT_MS=15000` (15 sec)

# Cloud Mode Requirements

Required env vars (build-time):
- `VITE_MILO_MODE=cloud` - Enable cloud mode
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key

See `frontend/.env.example` for cloud configuration.

# Letterboxd Import

Parsed client-side in `frontend/src/api/letterboxdClient.js` (local mode: via backend API; cloud mode: direct Supabase inserts).

# No Verification Commands

No tests, linting, type checking, or CI configured. Do not run verification commands.