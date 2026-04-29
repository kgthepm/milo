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
- `backend/database.js` - SQLite connection and schema initialization (auto-creates movies table)
- `backend/routes/index.js` - All API routes
- `frontend/src/api/movieApi.js` - API client (uses `VITE_API_BASE` env var)
- `frontend/src/utils/MovieContext.jsx` - State management via React Context

# Environment

Frontend API endpoint configured in `frontend/.env`:
```
VITE_API_BASE=http://localhost:3000/api
```

Update for network access and restart frontend after changing.

# Database

SQLite `movies.db` file is auto-created on first backend run. Schema: `id, title, rating (1-10), genre, date_watched, notes, created_at`.

# No Testing/Typecheck

This repo has no tests, linting, type checking, or CI configured. Do not run verification commands unless you add them.
