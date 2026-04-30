# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cine-Metric** — a personal movie and TV tracking dashboard. React frontend + Express/SQLite backend, no tests or linting configured.

## Running the App

Start both servers together:
```bash
./start.sh        # Linux/macOS
start.bat         # Windows
```

Or separately:
```bash
# Terminal 1
cd backend && node server.js      # http://localhost:3000

# Terminal 2
cd frontend && npm run dev        # http://localhost:5173
```

Install dependencies after cloning:
```bash
cd backend && npm install
cd ../frontend && npm install
```

## Architecture

**Single SQLite table** (`movies.db` in project root) stores both movies and TV series, distinguished by a `type` column (`'movie'` | `'tv'`). Schema: `id, title, rating (REAL 1-10), genre, date_watched, notes, director, type, num_seasons, total_episodes, created_at`.

`backend/database.js` auto-creates the DB and runs migrations on startup — it detects missing columns and rebuilds the table via rename if needed.

**API routing**: Vite dev server proxies `/api/*` → `http://localhost:3000`. The frontend `api/movieApi.js` always uses relative `/api` paths, so no env vars are needed for local dev. The `/api/movies` endpoint accepts a `type` query param to filter by content type; `/api/tv` is a convenience alias for TV-only queries.

**State management**: `frontend/src/utils/MovieContext.jsx` (movies) and a parallel TV context provide app-wide state via React Context. Components consume these via hooks rather than fetching directly.

**AI Recommendations**: `backend/ollama-recommender.js` calls a local Ollama instance (`http://localhost:11434` by default) with a 24-hour in-memory cache keyed by model. The frontend fetches the available model list from `/api/ollama/models` (embedding models filtered out) and the user picks one via the UI before clicking **Generate**. There is no hardcoded model default — if `OLLAMA_MODEL` env var is unset and no model is passed in the request, the backend errors loudly. On any Ollama failure (model not pulled, service down, etc.), the route returns a `simple` source with the raw Ollama error in `aiErrorMessage` so the frontend can display it.

## Key Configuration

| Setting | Default | Override |
|---|---|---|
| Backend port | 3000 | `PORT` env var |
| Frontend port | 5173 | `frontend/vite.config.js` |
| Ollama URL | `http://localhost:11434` | `OLLAMA_URL` env var |
| Ollama model | _none — picked in UI per request_ | `OLLAMA_MODEL` env var (optional) |
| Ollama generate timeout | 480000 ms (8 min) | `OLLAMA_TIMEOUT_MS` env var |
| Ollama models endpoint timeout | 30000 ms | `OLLAMA_MODELS_TIMEOUT_MS` env var |
| Ollama status endpoint timeout | 15000 ms | `OLLAMA_STATUS_TIMEOUT_MS` env var |

## No Tests or Build Step

There are no tests, linting, or type-checking configured. Do not run `npm test`, `npm run lint`, or `tsc` — they will fail or do nothing.
