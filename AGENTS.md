# Project Structure

Simple monorepo:
- `backend/` - Node.js + Express + SQLite (port 3000)
- `frontend/` - React + Vite + Tailwind CSS (port 5173)
- `movies.db` - SQLite database auto-created in project root

# Startup

Use start scripts - they auto-install dependencies on first run:
- Linux/macOS: `./start.sh`
- Windows: `start.bat`

Or manually:
- Backend: `cd backend && node server.js`
- Frontend: `cd frontend && npm run dev`

Both servers bind to `0.0.0.0` for network access.

# Key Files

- `backend/server.js` - Main entry point (loads .env, binds to 0.0.0.0)
- `backend/database.js` - SQLite connection, schema init, auto-migration via `migrateDatabase()`
- `backend/routes/index.js` - All API routes (movies and TV)
- `backend/ollama-recommender.js` - AI recommendations using Ollama (optional)
- `frontend/src/api/movieApi.js` - API client uses `/api` (proxied via Vite)
- `frontend/src/utils/MovieContext.jsx` - State management via React Context
- `frontend/vite.config.js` - Vite proxy: `/api` -> `http://localhost:3000`

# Database

SQLite `movies.db` auto-created on first backend run in project root.

Schema: `id, title, rating (1-10), genre, date_watched, notes, director, release_year, type (movie/tv), num_seasons, total_episodes, created_at`

Auto-migration on startup via `database.js:migrateDatabase()` handles schema changes automatically.

# OLLAMA (Optional)

AI recommendations use Ollama if available. Configure in `backend/.env` (all have defaults):
- `OLLAMA_URL=http://localhost:11434`
- `OLLAMA_MODEL=qwen3.5:2b`
- `OLLAMA_TIMEOUT_MS=480000` (8 min)
- `OLLAMA_MODELS_TIMEOUT_MS=30000` (30 sec)
- `OLLAMA_STATUS_TIMEOUT_MS=15000` (15 sec)

Gracefully degrades to fallback recommendations if Ollama unavailable. AI responses cached 24h per cache key (`contentType:type:model`).

# No Verification Commands

No tests, linting, type checking, or CI configured. Do not run verification commands.
