# Cine-Metric

Cine-Metric is a personal movie and TV tracking app built with React, Express, and SQLite. It lets you log what you watched, rate it on a 1-10 scale, review your watch history, and optionally generate recommendations with Ollama.

## Features

- Track movies and TV series in one app
- Store ratings, genres, notes, watch dates, and release years
- Track TV-specific metadata like seasons and total episodes
- Search and filter by title, notes, genre, and rating
- View analytics and watch-history timeline data
- Import rated movies from Letterboxd `ratings.csv`
- Generate optional AI recommendations with Ollama
- Use a local SQLite database with automatic schema migration

## Stack

- Frontend: React 18, Vite, Tailwind CSS, Framer Motion, React Router
- Backend: Node.js, Express 5, SQLite3
- AI: Ollama (optional)

## Project Layout

```text
cine-metric/
├── backend/
│   ├── database.js
│   ├── ollama-recommender.js
│   ├── routes/index.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   ├── vite.config.js
│   └── package.json
├── movies.db
├── start.bat
├── start.ps1
├── start.sh
└── README.md
```

## Requirements

- Node.js 18+
- npm
- Ollama, only if you want AI recommendations

## Setup

Install dependencies manually:

```bash
cd backend
npm install
cd ../frontend
npm install
```

Or use one of the provided start scripts, which installs dependencies before launching the app.

## Running The App

### Start scripts

macOS/Linux:

```bash
./start.sh
```

Windows PowerShell:

```powershell
./start.ps1
```

Windows Command Prompt:

```bat
start.bat
```

### Manual start

Backend:

```bash
cd backend
npm start
```

Frontend:

```bash
cd frontend
npm run dev
```

### Local URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`

Both servers bind to `0.0.0.0`, so the frontend is also reachable from other devices on your local network at `http://<your-ip>:5173`.

## Configuration

Backend configuration lives in `backend/.env`. Copy `backend/.env.example` to `backend/.env` if you want to override defaults.

Available settings:

- `PORT` - backend port, defaults to `3000`
- `OLLAMA_URL` - Ollama base URL, defaults to `http://localhost:11434`
- `OLLAMA_MODEL` - default model for recommendations
- `OLLAMA_TIMEOUT_MS` - recommendation generation timeout
- `OLLAMA_MODELS_TIMEOUT_MS` - installed-model list timeout
- `OLLAMA_STATUS_TIMEOUT_MS` - Ollama status-check timeout

If you change the backend port, also update the Vite proxy target in `frontend/vite.config.js`.

## Ollama Support

AI recommendations are optional. If Ollama is unavailable, the app falls back to simple recommendations.

Basic Ollama setup:

```bash
ollama serve
ollama pull qwen3.5:2b
```

Relevant API endpoints:

- `GET /api/ollama/status`
- `GET /api/ollama/models`
- `GET /api/recommendations?type=all&content=movie`

Recommendation requests also support:

- `type=similar|hidden_gems|all`
- `content=movie|tv|all`
- `model=<installed-model-name>`
- `refresh=true` to bypass cached results

## Letterboxd Import

The movies UI includes a Letterboxd import flow for rated movies.

- Upload `ratings.csv`
- Letterboxd ratings are converted to the app's 1-10 scale
- Existing movie entries are matched and updated when possible
- Unrated or invalid rows are skipped

The backend import endpoint is `POST /api/movies/import`.

## Database

The app stores data in `movies.db` at the repo root. The file is created automatically the first time the backend starts.

The main table includes:

- `id`
- `title`
- `rating`
- `genre`
- `date_watched`
- `notes`
- `director`
- `release_year`
- `type` (`movie` or `tv`)
- `num_seasons`
- `total_episodes`
- `created_at`

Schema updates are handled automatically on backend startup.

## API Summary

### Movies

- `GET /api/movies`
- `POST /api/movies`
- `PUT /api/movies/:id`
- `DELETE /api/movies/:id`
- `POST /api/movies/import`

`GET /api/movies` supports these query params:

- `search`
- `genre`
- `minRating`
- `maxRating`
- `startDate`
- `endDate`
- `type`

### TV

- `GET /api/tv`
- `POST /api/tv`
- `PUT /api/tv/:id`
- `DELETE /api/tv/:id`
- `GET /api/tv/analytics`

### Analytics

- `GET /api/analytics`

`GET /api/analytics` supports `type=movie|tv`.

## Frontend Routing

- `/` - movies page
- `/movies` - movies page
- `/tv` - TV series page

## Notes

- Frontend API calls use relative `/api` paths and rely on the Vite proxy in `frontend/vite.config.js`
- There is currently no test, lint, typecheck, or CI setup in this repo
- `movies.db` contains your saved data, so back it up if you care about preserving your watch history
