# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MILO** — a movie and TV tracking dashboard. Ships in two modes:

- **Local mode** (default): React frontend + Express/SQLite backend, Ollama-only AI, single user.
- **Cloud mode**: same React app talks to Supabase (Postgres + Auth) for CRUD and calls LLM providers **directly from the browser** using user-supplied API keys (BYOK). No backend AI inference, no server-side secrets.

Mode is chosen at build time via `VITE_MILO_MODE=local|cloud`. Both modes ship from one codebase.

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

## Cloud mode

When `VITE_MILO_MODE=cloud`:

- **DB**: Supabase Postgres (`movies` table). RLS scopes every row to `auth.uid() = user_id`. Schema lives in `supabase/migrations/0001_init.sql`.
- **Auth**: `frontend/src/components/AuthGate.jsx` wraps the app with a Supabase email/password sign-in; gate is a no-op in local mode.
- **CRUD**: `frontend/src/api/cloud.js` uses the Supabase JS client directly from the browser. `frontend/src/api/movieApi.js` / `tvApi.js` / `assistantApi.js` are tiny switchers that import from `cloud.js` or `*.local.js` based on `VITE_MILO_MODE`.
- **AI (BYOK)**: providers live in `frontend/src/ai/providers/{openrouter,anthropic,ollama}.js`. The user pastes their key into the Settings modal (top-right gear), keys are stored in `localStorage` under `milo.aiSettings.v1` and **never sent to a Milo-controlled server**. v1 providers: OpenRouter (preferred — one key, many models), Anthropic direct, and Ollama (user-supplied URL).
- **Letterboxd import**: parsed client-side in `frontend/src/api/letterboxdClient.js`; rows inserted via Supabase client.
- **Required env**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. See `frontend/.env.example`.
- **Migration from local SQLite**: `scripts/migrate-sqlite-to-supabase.js --user-id <auth-uid>` with `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` env vars.

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
| Milo mode | `local` | `VITE_MILO_MODE=cloud` to enable Supabase + BYOK |
| Supabase URL (cloud only) | _none_ | `VITE_SUPABASE_URL` env var |
| Supabase anon key (cloud only) | _none_ | `VITE_SUPABASE_ANON_KEY` env var |

## No Tests or Build Step

There are no tests, linting, or type-checking configured. Do not run `npm test`, `npm run lint`, or `tsc` — they will fail or do nothing.
