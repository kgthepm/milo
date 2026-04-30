# Project Structure

Simple monorepo with:
- `backend/` - Node.js + Express + SQLite (port 3000)
- `frontend/` - React + Vite + Tailwind CSS (port 5173)
- `movies.db` - SQLite database auto-created in project root

# Startup

Run both servers: `./start.sh`

Or start separately:
- Backend: `cd backend && node server.js`
- Frontend: `cd frontend && npm run dev`

Both servers bind to `0.0.0.0` for network access.

# Key Files

- `backend/server.js` - Main server entry point
- `backend/database.js` - SQLite connection, schema init, and auto-migration
- `backend/routes/index.js` - All API routes (movies and TV)
- `backend/ollama-recommender.js` - AI recommendations using Ollama (optional)
- `frontend/src/api/movieApi.js` - API client uses relative `/api` (proxied)
- `frontend/src/utils/MovieContext.jsx` - State management via React Context

# API Proxy

Frontend uses Vite proxy to forward `/api` requests to backend. Client uses `/api` not `http://localhost:3000/api`.

# Database

SQLite `movies.db` auto-created on first backend run. Schema includes TV support:
- `id, title, rating (1-10), genre, date_watched, notes, director, type (movie/tv), num_seasons, total_episodes, created_at`

Database auto-migrates on startup via `database.js:migrateDatabase()`. Schema changes handled automatically.

# OLLAMA (Optional)

AI recommendations use Ollama if available. Configure in `backend/.env`:
- `OLLAMA_URL=http://localhost:11434`
- `OLLAMA_MODEL=qwen3.5:2b`

Gracefully degrades to fallback recommendations if Ollama unavailable. AI responses cached 24h per content type (`movie` or `tv`) and recommendation type (`similar` or `hidden_gems`).

# No Testing/Typecheck

This repo has no tests, linting, type checking, or CI configured. Do not run verification commands unless you add them.
