const express = require('express');
const http = require('http');
const { parse } = require('csv-parse/sync');
const db = require('../database');
const ollamaRecommender = require('../ollama-recommender');

const router = express.Router();
const MIN_RELEASE_YEAR = 1888;
const RELEASE_YEAR_FUTURE_BUFFER = 5;

function dbAll(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(rows);
    });
  });
}

function dbRun(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this);
    });
  });
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function emptyToNull(value) {
  const trimmed = normalizeText(value);
  return trimmed || null;
}

function normalizeDate(value) {
  const trimmed = normalizeText(value);

  if (!trimmed) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getMaxReleaseYear() {
  return new Date().getFullYear() + RELEASE_YEAR_FUTURE_BUFFER;
}

function normalizeReleaseYear(value) {
  if (value == null) {
    return null;
  }

  if (typeof value === 'number') {
    if (!Number.isInteger(value)) {
      return null;
    }

    return value >= MIN_RELEASE_YEAR && value <= getMaxReleaseYear() ? value : null;
  }

  const trimmed = normalizeText(value);

  if (!trimmed || !/^\d{4}$/.test(trimmed)) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  return parsed >= MIN_RELEASE_YEAR && parsed <= getMaxReleaseYear() ? parsed : null;
}

function getReleaseYearValidationError(value) {
  if (value == null) {
    return null;
  }

  if (typeof value === 'string' && !value.trim()) {
    return null;
  }

  if (normalizeReleaseYear(value) == null) {
    return `Release year must be a 4-digit year between ${MIN_RELEASE_YEAR} and ${getMaxReleaseYear()}`;
  }

  return null;
}

function normalizeRating(value) {
  if (value == null) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = normalizeText(value);

    if (!trimmed) {
      return null;
    }

    const parsed = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : Number.NaN;
  }

  return Number.NaN;
}

function getRatingValidationError(value) {
  const normalizedRating = normalizeRating(value);

  if (Number.isNaN(normalizedRating)) {
    return 'Rating must be a number between 1 and 10';
  }

  if (normalizedRating == null) {
    return null;
  }

  if (normalizedRating < 1 || normalizedRating > 10) {
    return 'Rating must be between 1 and 10';
  }

  return null;
}

function parseLetterboxdRating(value) {
  const trimmed = normalizeText(value);

  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseFloat(trimmed);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  const converted = parsed * 2;
  return converted >= 1 && converted <= 10 ? converted : null;
}

function parseCsvHeaders(csvText, fileLabel) {
  try {
    const [headerRow = []] = parse(csvText, {
      bom: true,
      relax_column_count: true,
      to_line: 1,
      trim: true,
    });

    return headerRow;
  } catch (error) {
    throw new Error(`Failed to read ${fileLabel} headers: ${error.message}`);
  }
}

function parseLetterboxdCsv(csvText, fileLabel, requiredHeaders = []) {
  const rawText = typeof csvText === 'string' ? csvText : '';

  if (!rawText.trim()) {
    return [];
  }

  const headers = parseCsvHeaders(rawText, fileLabel);
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

  if (missingHeaders.length > 0) {
    throw new Error(`${fileLabel} is missing required columns: ${missingHeaders.join(', ')}`);
  }

  try {
    return parse(rawText, {
      bom: true,
      columns: true,
      relax_column_count: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (error) {
    throw new Error(`Failed to parse ${fileLabel}: ${error.message}`);
  }
}

function getLetterboxdEntryKey(row) {
  const uri = normalizeText(row['Letterboxd URI']);

  if (uri) {
    return `uri:${uri}`;
  }

  const title = normalizeText(row.Name).toLowerCase();
  const year = normalizeText(row.Year);

  if (title && year) {
    return `title:${title}:${year}`;
  }

  if (title) {
    return `title:${title}`;
  }

  return null;
}

function buildImportedMovieKey(movie) {
  return [
    normalizeText(movie.title).toLowerCase(),
    movie.date_watched || '',
    movie.rating == null ? '' : String(Number(movie.rating)),
    movie.type || 'movie',
  ].join('::');
}

function getImportedMovieYear(movie) {
  return movie.release_year == null ? null : Number(movie.release_year);
}

function isCompatibleImportedMovieYear(existingMovie, importedMovie) {
  const existingYear = getImportedMovieYear(existingMovie);
  const importedYear = getImportedMovieYear(importedMovie);

  return existingYear == null || importedYear == null || existingYear === importedYear;
}

function findImportedMovieMatch(existingMovies, importedMovie) {
  const importedTitle = normalizeText(importedMovie.title).toLowerCase();
  const importedYear = getImportedMovieYear(importedMovie);
  const importedType = importedMovie.type || 'movie';
  const sameTitleMovies = existingMovies.filter(movie => (
    (movie.type || 'movie') === importedType &&
    normalizeText(movie.title).toLowerCase() === importedTitle
  ));

  const exactKeyCandidates = sameTitleMovies.filter(movie => buildImportedMovieKey(movie) === buildImportedMovieKey(importedMovie));

  if (exactKeyCandidates.length === 1 && isCompatibleImportedMovieYear(exactKeyCandidates[0], importedMovie)) {
    return exactKeyCandidates[0];
  }

  if (exactKeyCandidates.length > 1) {
    const exactYearCandidates = exactKeyCandidates.filter(movie => getImportedMovieYear(movie) === importedYear);

    if (exactYearCandidates.length === 1) {
      return exactYearCandidates[0];
    }

    if (exactYearCandidates.length === 0) {
      const nullYearCandidates = exactKeyCandidates.filter(movie => getImportedMovieYear(movie) == null);

      if (nullYearCandidates.length === 1) {
        return nullYearCandidates[0];
      }
    }

    return null;
  }

  if (importedYear != null) {
    const sameYearMovies = sameTitleMovies.filter(movie => getImportedMovieYear(movie) === importedYear);

    if (sameYearMovies.length === 1) {
      return sameYearMovies[0];
    }

    if (sameYearMovies.length === 0 && sameTitleMovies.length === 1 && getImportedMovieYear(sameTitleMovies[0]) == null) {
      return sameTitleMovies[0];
    }

    return null;
  }

  return sameTitleMovies.length === 1 ? sameTitleMovies[0] : null;
}

function hasImportedMovieChanges(existingMovie, importedMovie) {
  if (existingMovie.title !== importedMovie.title) {
    return true;
  }

  if (importedMovie.rating != null && Number(existingMovie.rating) !== Number(importedMovie.rating)) {
    return true;
  }

  if (importedMovie.release_year != null && getImportedMovieYear(existingMovie) !== getImportedMovieYear(importedMovie)) {
    return true;
  }

  if (importedMovie.date_watched != null && existingMovie.date_watched !== importedMovie.date_watched) {
    return true;
  }

  if (importedMovie.notes != null && existingMovie.notes !== importedMovie.notes) {
    return true;
  }

  return false;
}

function applyImportedMovieUpdate(existingMovie, importedMovie) {
  existingMovie.title = importedMovie.title;

  if (importedMovie.rating != null) {
    existingMovie.rating = importedMovie.rating;
  }

  if (importedMovie.release_year != null) {
    existingMovie.release_year = importedMovie.release_year;
  }

  if (importedMovie.date_watched != null) {
    existingMovie.date_watched = importedMovie.date_watched;
  }

  if (importedMovie.notes != null) {
    existingMovie.notes = importedMovie.notes;
  }

  return existingMovie;
}

function mergeLetterboxdExports(watchedRows, ratingsRows, reviewRows) {
  const mergedEntries = new Map();

  const upsertEntry = (row, source) => {
    const key = getLetterboxdEntryKey(row);
    const releaseYear = normalizeReleaseYear(row.Year);

    if (!key) {
      return;
    }

    const existingEntry = mergedEntries.get(key) || {
      title: emptyToNull(row.Name),
      rating: null,
      release_year: releaseYear,
      watchedDate: null,
      ratedDate: null,
      reviewWatchedDate: null,
      review: null,
    };

    if (!existingEntry.title) {
      existingEntry.title = emptyToNull(row.Name);
    }

    if (existingEntry.release_year == null && releaseYear != null) {
      existingEntry.release_year = releaseYear;
    }

    if (source === 'watched' && !existingEntry.watchedDate) {
      existingEntry.watchedDate = normalizeDate(row.Date);
    }

    if (source === 'ratings') {
      if (existingEntry.rating == null) {
        existingEntry.rating = parseLetterboxdRating(row.Rating);
      }

      if (!existingEntry.ratedDate) {
        existingEntry.ratedDate = normalizeDate(row.Date);
      }
    }

    if (source === 'reviews') {
      if (existingEntry.rating == null) {
        existingEntry.rating = parseLetterboxdRating(row.Rating);
      }

      if (!existingEntry.reviewWatchedDate) {
        existingEntry.reviewWatchedDate = normalizeDate(row['Watched Date']) || normalizeDate(row.Date);
      }

      if (!existingEntry.review) {
        existingEntry.review = emptyToNull(row.Review);
      }
    }

    mergedEntries.set(key, existingEntry);
  };

  watchedRows.forEach(row => upsertEntry(row, 'watched'));
  ratingsRows.forEach(row => upsertEntry(row, 'ratings'));
  reviewRows.forEach(row => upsertEntry(row, 'reviews'));

  return Array.from(mergedEntries.values()).map(entry => ({
    title: entry.title,
    rating: entry.rating,
    release_year: entry.release_year,
    date_watched: entry.reviewWatchedDate || entry.watchedDate || entry.ratedDate || null,
    notes: entry.review,
    type: 'movie',
  }));
}

async function syncImportedMovies(moviesToInsert, moviesToUpdate) {
  const insertQuery = `
    INSERT INTO movies (title, rating, genre, date_watched, notes, director, release_year, type, num_seasons, total_episodes)
    VALUES (?, ?, NULL, ?, ?, NULL, ?, 'movie', NULL, NULL)
  `;

  const updateQuery = `
    UPDATE movies
    SET title = ?, rating = COALESCE(?, rating), date_watched = COALESCE(?, date_watched), notes = COALESCE(?, notes), release_year = COALESCE(?, release_year)
    WHERE id = ? AND type = 'movie'
  `;

  await dbRun('BEGIN TRANSACTION');

  try {
    for (const movie of moviesToUpdate) {
      await dbRun(updateQuery, [movie.title, movie.rating, movie.date_watched, movie.notes, movie.release_year, movie.id]);
    }

    for (const movie of moviesToInsert) {
      await dbRun(insertQuery, [movie.title, movie.rating, movie.date_watched, movie.notes, movie.release_year]);
    }

    await dbRun('COMMIT');
  } catch (error) {
    try {
      await dbRun('ROLLBACK');
    } catch {
      // Ignore rollback failures so the original import error is returned.
    }

    throw error;
  }
}

router.get('/ollama/models', (req, res) => {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const url = new URL(ollamaUrl);

  const options = {
    hostname: url.hostname,
    port: url.port || 11434,
    path: '/api/tags',
    method: 'GET',
    timeout: parseInt(process.env.OLLAMA_MODELS_TIMEOUT_MS, 10) || 30000
  };

  const request = http.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => { data += chunk; });
    response.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const allNames = (parsed.models || []).map(m => m.name);
        const models = allNames.filter(name => !/embed/i.test(name));
        res.json({ models });
      } catch {
        res.json({ models: [], error: 'Failed to parse Ollama response' });
      }
    });
  });

  request.on('error', (err) => res.json({ models: [], error: `Ollama unavailable: ${err.message}` }));
  request.on('timeout', () => { request.destroy(); res.json({ models: [], error: 'Ollama timeout' }); });
  request.end();
});

router.get('/ollama/status', (req, res) => {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const configuredModel = process.env.OLLAMA_MODEL || 'qwen2.5:2b';
  const url = new URL(ollamaUrl);
  const options = {
    hostname: url.hostname,
    port: url.port || 11434,
    path: '/api/tags',
    method: 'GET',
    timeout: parseInt(process.env.OLLAMA_STATUS_TIMEOUT_MS, 10) || 15000
  };
  const request = http.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => { data += chunk; });
    response.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const models = (parsed.models || []).map(m => m.name);
        res.json({ reachable: true, configuredModel, modelAvailable: models.includes(configuredModel), availableModels: models });
      } catch {
        res.json({ reachable: true, configuredModel, modelAvailable: false, availableModels: [], error: 'Failed to parse Ollama response' });
      }
    });
  });
  request.on('error', () => res.json({ reachable: false, configuredModel, modelAvailable: false, availableModels: [], error: 'Ollama unreachable' }));
  request.on('timeout', () => { request.destroy(); res.json({ reachable: false, configuredModel, modelAvailable: false, availableModels: [], error: 'Ollama timeout' }); });
  request.end();
});

router.get('/movies', (req, res) => {
  const { search, genre, minRating, maxRating, startDate, endDate, type } = req.query;

  let query = 'SELECT * FROM movies WHERE 1=1';
  const params = [];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  if (search) {
    query += ' AND (title LIKE ? OR notes LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (genre) {
    query += ' AND genre = ?';
    params.push(genre);
  }

  if (minRating) {
    query += ' AND rating >= ?';
    params.push(minRating);
  }

  if (maxRating) {
    query += ' AND rating <= ?';
    params.push(maxRating);
  }

  if (startDate) {
    query += ' AND date_watched >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND date_watched <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY CASE WHEN date_watched IS NULL THEN 1 ELSE 0 END, date_watched DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.post('/movies', (req, res) => {
  const { title, rating, genre, date_watched, notes, director, release_year, type, num_seasons, total_episodes } = req.body;

  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const ratingError = getRatingValidationError(rating);

  if (ratingError) {
    res.status(400).json({ error: ratingError });
    return;
  }

  const releaseYearError = getReleaseYearValidationError(release_year);

  if (releaseYearError) {
    res.status(400).json({ error: releaseYearError });
    return;
  }

  const normalizedRating = normalizeRating(rating);
  const normalizedReleaseYear = normalizeReleaseYear(release_year);

  const query = `
    INSERT INTO movies (title, rating, genre, date_watched, notes, director, release_year, type, num_seasons, total_episodes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [title, normalizedRating, genre, date_watched, notes, director, normalizedReleaseYear, type || 'movie', num_seasons, total_episodes], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, title, rating: normalizedRating, genre, date_watched, notes, director, release_year: normalizedReleaseYear, type: type || 'movie', num_seasons, total_episodes });
  });
});

router.post('/movies/import', async (req, res) => {
  const { watchedCsv = '', ratingsCsv = '', reviewsCsv = '' } = req.body || {};

  const hasUploadedImportData = [watchedCsv, ratingsCsv, reviewsCsv].some(csvText => normalizeText(csvText));

  if (!hasUploadedImportData) {
    res.status(400).json({ error: 'Upload at least one Letterboxd watched.csv, ratings.csv, or reviews.csv file.' });
    return;
  }

  try {
    const watchedRows = parseLetterboxdCsv(watchedCsv, 'watched.csv', ['Name']);
    const ratingsRows = parseLetterboxdCsv(ratingsCsv, 'ratings.csv', ['Name', 'Rating']);
    const reviewRows = parseLetterboxdCsv(reviewsCsv, 'reviews.csv', ['Name', 'Review']);

    const mergedMovies = mergeLetterboxdExports(watchedRows, ratingsRows, reviewRows);

    if (mergedMovies.length === 0) {
      res.status(400).json({ error: 'No Letterboxd entries were found in the uploaded files.' });
      return;
    }

    const existingMovies = await dbAll('SELECT id, title, rating, release_year, date_watched, notes, type FROM movies WHERE type = ?', ['movie']);
    const trackedMovies = [...existingMovies];
    const moviesToInsert = [];
    const moviesToUpdate = [];

    let skippedDuplicates = 0;
    let skippedInvalid = 0;
    let updated = 0;

    mergedMovies.forEach(movie => {
      if (!movie.title) {
        skippedInvalid += 1;
        return;
      }

      const matchedMovie = findImportedMovieMatch(trackedMovies, movie);

      if (matchedMovie) {
        if (!hasImportedMovieChanges(matchedMovie, movie)) {
          skippedDuplicates += 1;
          return;
        }

        moviesToUpdate.push({ id: matchedMovie.id, ...movie });
        applyImportedMovieUpdate(matchedMovie, movie);
        updated += 1;
        return;
      }

      moviesToInsert.push(movie);
    });

    await syncImportedMovies(moviesToInsert, moviesToUpdate);

    res.status(201).json({
      totalCandidates: mergedMovies.length,
      inserted: moviesToInsert.length,
      updated,
      skippedDuplicates,
      skippedInvalid,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/movies/:id', (req, res) => {
  const { title, rating, genre, date_watched, notes, director, release_year, type, num_seasons, total_episodes } = req.body;
  const { id } = req.params;

  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const ratingError = getRatingValidationError(rating);

  if (ratingError) {
    res.status(400).json({ error: ratingError });
    return;
  }

  const releaseYearError = getReleaseYearValidationError(release_year);

  if (releaseYearError) {
    res.status(400).json({ error: releaseYearError });
    return;
  }

  const normalizedRating = normalizeRating(rating);
  const normalizedReleaseYear = normalizeReleaseYear(release_year);

  const query = `
    UPDATE movies
    SET title = ?, rating = ?, genre = ?, date_watched = ?, notes = ?, director = ?, release_year = ?, type = ?, num_seasons = ?, total_episodes = ?
    WHERE id = ?
  `;

  db.run(query, [title, normalizedRating, genre, date_watched, notes, director, normalizedReleaseYear, type || 'movie', num_seasons, total_episodes, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }
    res.json({ id, title, rating: normalizedRating, genre, date_watched, notes, director, release_year: normalizedReleaseYear, type: type || 'movie', num_seasons, total_episodes });
  });
});

router.delete('/movies/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM movies WHERE id = ?';

  db.run(query, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }
    res.json({ message: 'Movie deleted successfully' });
  });
});

router.get('/tv', (req, res) => {
  const { search, genre, minRating, maxRating, startDate, endDate } = req.query;

  let query = 'SELECT * FROM movies WHERE type = ?';
  const params = ['tv'];

  if (search) {
    query += ' AND (title LIKE ? OR notes LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (genre) {
    query += ' AND genre = ?';
    params.push(genre);
  }

  if (minRating) {
    query += ' AND rating >= ?';
    params.push(minRating);
  }

  if (maxRating) {
    query += ' AND rating <= ?';
    params.push(maxRating);
  }

  if (startDate) {
    query += ' AND date_watched >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND date_watched <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY CASE WHEN date_watched IS NULL THEN 1 ELSE 0 END, date_watched DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/tv/analytics', (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total FROM movies WHERE type = ?',
    'SELECT AVG(rating) as avg_rating FROM movies WHERE type = ?',
    'SELECT genre, COUNT(*) as count FROM movies WHERE type = ? AND genre IS NOT NULL GROUP BY genre ORDER BY count DESC',
    "SELECT date_watched, COUNT(*) as count FROM movies WHERE type = ? AND date_watched IS NOT NULL GROUP BY date_watched ORDER BY date_watched DESC"
  ];

  Promise.all(queries.map(q => new Promise((resolve, reject) => {
    db.all(q, ['tv'], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  })))
  .then(([total, avgRating, genreData, timelineData]) => {
    const topGenres = genreData.slice(0, 5);
    const recommendations = generateTVRecommendations(genreData);

    res.json({
      total: total[0].total,
      avgRating: avgRating[0].avg_rating != null ? Math.round(avgRating[0].avg_rating * 100) / 100 : null,
      topGenres,
      timeline: timelineData,
      recommendations
    });
  })
  .catch(err => {
    res.status(500).json({ error: err.message });
  });
});

router.post('/tv', (req, res) => {
  const { title, rating, genre, date_watched, notes, num_seasons, total_episodes } = req.body;

  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const ratingError = getRatingValidationError(rating);

  if (ratingError) {
    res.status(400).json({ error: ratingError });
    return;
  }

  const normalizedRating = normalizeRating(rating);

  const query = `
    INSERT INTO movies (title, rating, genre, date_watched, notes, type, num_seasons, total_episodes)
    VALUES (?, ?, ?, ?, ?, 'tv', ?, ?)
  `;

  db.run(query, [title, normalizedRating, genre, date_watched, notes, num_seasons, total_episodes], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, title, rating: normalizedRating, genre, date_watched, notes, type: 'tv', num_seasons, total_episodes });
  });
});

router.put('/tv/:id', (req, res) => {
  const { title, rating, genre, date_watched, notes, num_seasons, total_episodes } = req.body;
  const { id } = req.params;

  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const ratingError = getRatingValidationError(rating);

  if (ratingError) {
    res.status(400).json({ error: ratingError });
    return;
  }

  const normalizedRating = normalizeRating(rating);

  const query = `
    UPDATE movies
    SET title = ?, rating = ?, genre = ?, date_watched = ?, notes = ?, type = 'tv', num_seasons = ?, total_episodes = ?
    WHERE id = ? AND type = 'tv'
  `;

  db.run(query, [title, normalizedRating, genre, date_watched, notes, num_seasons, total_episodes, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'TV series not found' });
      return;
    }
    res.json({ id, title, rating: normalizedRating, genre, date_watched, notes, type: 'tv', num_seasons, total_episodes });
  });
});

router.delete('/tv/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM movies WHERE id = ? AND type = ?';

  db.run(query, [id, 'tv'], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'TV series not found' });
      return;
    }
    res.json({ message: 'TV series deleted successfully' });
  });
});

router.get('/recommendations', async (req, res) => {
  const { type = 'all', content = 'movie', refresh = 'false', model } = req.query;
  const shouldRefresh = refresh === 'true';

  try {
    const contentTypes = content === 'all' ? ['movie', 'tv'] : [content];
    const recommendationTypes = type === 'all' ? ['similar', 'hidden_gems'] : [type];

    const query = `SELECT * FROM movies WHERE type IN (${contentTypes.map(() => '?').join(',')})`;
    const params = contentTypes;

    // Wrap db.all in a promise
    const userMovies = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (shouldRefresh) {
      recommendationTypes.forEach(recType => {
        contentTypes.forEach(contentType => {
          ollamaRecommender.clearCache(contentType, recType, model);
        });
      });
    }

    let allRecommendations = [];
    let aiError = null;

    for (const recType of recommendationTypes) {
      for (const contentType of contentTypes) {
        try {
          const result = await ollamaRecommender.generateRecommendations(
            userMovies,
            recType,
            contentType,
            model
          );

          if (result.recommendations && result.recommendations.length > 0) {
            allRecommendations = allRecommendations.concat(
              result.recommendations.map(rec => ({
                ...rec,
                type: recType,
                contentType,
                cached: result.cached
              }))
            );
          }
        } catch (error) {
          aiError = error;
          console.error(`AI recommendation failed for ${contentType}/${recType}:`, error.message);
        }
      }
    }

    if (allRecommendations.length > 0) {
      res.json({
        recommendations: allRecommendations,
        source: 'ai',
        message: 'AI-powered recommendations based on your viewing history'
      });
    } else {
      const fallbackRecommendations = content === 'tv'
        ? generateTVRecommendationsFallback(userMovies)
        : generateRecommendationsFallback(userMovies);

      res.json({
        recommendations: fallbackRecommendations,
        source: 'simple',
        message: aiError
          ? 'AI recommendations failed — see details below.'
          : 'No AI recommendations yet. Try adding more movies or TV series!',
        aiErrorMessage: aiError ? aiError.message : null
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics', (req, res) => {
  const { type } = req.query;
  const typeCondition = type ? 'WHERE type = ?' : '';
  const typeParams = type ? [type] : [];
  
  const queries = [
    `SELECT COUNT(*) as total FROM movies ${typeCondition}`,
    `SELECT AVG(rating) as avg_rating FROM movies ${typeCondition}`,
    `SELECT genre, COUNT(*) as count FROM movies ${typeCondition ? typeCondition + ' AND' : 'WHERE'} genre IS NOT NULL GROUP BY genre ORDER BY count DESC`,
    type 
      ? `SELECT date_watched, COUNT(*) as count FROM movies ${typeCondition} AND date_watched IS NOT NULL GROUP BY date_watched ORDER BY date_watched DESC`
      : `SELECT date_watched, COUNT(*) as count FROM movies GROUP BY date_watched ORDER BY date_watched DESC`
  ];

  Promise.all(queries.map((q, i) => new Promise((resolve, reject) => {
    const params = i < 2 ? typeParams : (i === 2 && type ? [...typeParams] : []);
    db.all(q, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  })))
  .then(([total, avgRating, genreData, timelineData]) => {
    const topGenres = genreData.slice(0, 5);
    const recommendations = type === 'tv' 
      ? generateTVRecommendations(genreData)
      : generateRecommendations(genreData);

    res.json({
      total: total[0].total,
      avgRating: avgRating[0].avg_rating != null ? Math.round(avgRating[0].avg_rating * 100) / 100 : null,
      topGenres,
      timeline: timelineData,
      recommendations
    });
  })
  .catch(err => {
    res.status(500).json({ error: err.message });
  });
});

function generateRecommendations(genreData) {
  if (!genreData || genreData.length === 0) {
    return { message: 'Add more movies to get personalized recommendations!' };
  }

  const topGenre = genreData[0].genre;
  const genreBasedRecommendations = {
    'Action': 'The Dark Knight, Mad Max: Fury Road, John Wick, Mission Impossible, Die Hard',
    'Comedy': 'The Grand Budapest Hotel, Airplane!, Monty Python and the Holy Grail, Superbad, What We Do in the Shadows',
    'Drama': 'The Shawshank Redemption, The Godfather, Pulp Fiction, 12 Angry Men, Schindler\'s List',
    'Sci-Fi': 'Blade Runner, Inception, Interstellar, The Matrix, Arrival',
    'Horror': 'The Shining, Get Out, A Quiet Place, Hereditary, The Witch',
    'Thriller': 'Se7en, Silence of the Lambs, Zodiac, Prisoners, Gone Girl',
    'Romance': 'Eternal Sunshine of the Spotless Mind, Before Sunset, La La Land, The Notebook, Pride and Prejudice',
    'Animation': 'Spirited Away, Spider-Man: Into the Spider-Verse, Toy Story, Coco, Your Name',
    'Documentary': 'Planet Earth, Jiro Dreams of Sushi, The Social Dilemma, 13th, Free Solo',
    'Fantasy': 'The Lord of the Rings, Pan\'s Labyrinth, The Shape of Water, Harry Potter, The Princess Bride'
  };

  return {
    favoriteGenre: topGenre,
    suggestions: genreBasedRecommendations[topGenre] || 'Explore different genres to get recommendations!',
    message: `Based on your love for ${topGenre} movies, you might enjoy:`
  };
}

function generateTVRecommendations(genreData) {
  if (!genreData || genreData.length === 0) {
    return { message: 'Add more TV series to get personalized recommendations!' };
  }

  const topGenre = genreData[0].genre;
  const tvGenreBasedRecommendations = {
    'Action': "The Mandalorian, Game of Thrones, Vikings, The Boys, Peaky Blinders",
    'Comedy': "The Office, Parks & Recreation, Brooklyn Nine-Nine, It's Always Sunny in Philadelphia, Community",
    'Drama': "Breaking Bad, Better Call Saul, The Wire, Succession, The Sopranos",
    'Sci-Fi': "Stranger Things, Black Mirror, The Expanse, Westworld, Severance",
    'Horror': "The Haunting of Hill House, American Horror Story, Penny Dreadful, The Walking Dead",
    'Thriller': "Mindhunter, True Detective, The Killing, Hannibal, Ozark",
    'Romance': "Bridgerton, Outlander, Normal People, Love, Death & Robots, The Marvelous Mrs. Maisel",
    'Animation': "BoJack Horseman, Rick and Morty, Arcane, Avatar: The Last Airbender, Blue Eye Samurai",
    'Documentary': "Planet Earth, The Last Dance, Making a Murderer, Wild Wild Country, Chef's Table",
    'Fantasy': "Game of Thrones, The Witcher, His Dark Materials, Carnival Row, The Dark Crystal"
  };

  return {
    favoriteGenre: topGenre,
    suggestions: tvGenreBasedRecommendations[topGenre] || 'Explore different genres to get recommendations!',
    message: `Based on your love for ${topGenre} TV series, you might enjoy:`
  };
}

function generateRecommendationsFallback(userMovies) {
  if (!userMovies || userMovies.length === 0) {
    return [];
  }

  const genreCounts = {};
  userMovies.forEach(movie => {
    if (movie.genre) {
      genreCounts[movie.genre] = (genreCounts[movie.genre] || 0) + 1;
    }
  });

  const topGenre = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  const genreBasedMovies = {
    'Action': [
      { title: 'John Wick 4', year: 2023, genre: 'Action', explanation: 'Intense action sequences and stylish choreography', confidence: 8 },
      { title: 'Mission: Impossible 7', year: 2023, genre: 'Action', explanation: 'High-stakes spy thriller with incredible stunts', confidence: 8 },
      { title: 'Extraction 2', year: 2023, genre: 'Action', explanation: 'Brutal fight scenes and non-stop adrenaline', confidence: 7 }
    ],
    'Comedy': [
      { title: 'Everything Everywhere All at Once', year: 2022, genre: 'Comedy', explanation: 'Mind-bending comedy with incredible heart', confidence: 9 },
      { title: 'The Menu', year: 2022, genre: 'Comedy', explanation: 'Dark comedy satire of fine dining culture', confidence: 8 }
    ],
    'Drama': [
      { title: 'The Holdovers', year: 2023, genre: 'Drama', explanation: 'Character-driven story with excellent performances', confidence: 8 },
      { title: 'Past Lives', year: 2023, genre: 'Drama', explanation: 'Beautiful exploration of love and destiny', confidence: 8 }
    ],
    'Sci-Fi': [
      { title: 'Dune: Part Two', year: 2024, genre: 'Sci-Fi', explanation: 'Epic sci-fi with stunning visuals and deep themes', confidence: 9 },
      { title: 'Poor Things', year: 2023, genre: 'Sci-Fi', explanation: 'Bizarre and brilliant sci-fi satire', confidence: 8 }
    ],
    'Horror': [
      { title: 'Talk to Me', year: 2023, genre: 'Horror', explanation: 'Fresh take on supernatural horror with real stakes', confidence: 8 },
      { title: 'Hereditary', year: 2018, genre: 'Horror', explanation: 'Psychological horror masterpiece', confidence: 9 }
    ],
    'Thriller': [
      { title: 'The Killer', year: 2023, genre: 'Thriller', explanation: 'Stylish assassin thriller with meticulous direction', confidence: 8 },
      { title: 'Saltburn', year: 2023, genre: 'Thriller', explanation: 'Twisted psychological thriller', confidence: 7 }
    ]
  };

  const recommendations = genreBasedMovies[topGenre] || [
    { title: 'Oppenheimer', year: 2023, genre: 'Drama', explanation: 'Historical epic with brilliant performances', confidence: 9 },
    { title: 'Barbie', year: 2023, genre: 'Comedy', explanation: 'Subversive comedy with surprising depth', confidence: 8 }
  ];

  return recommendations.map(rec => ({ ...rec, type: 'similar', contentType: 'movie', cached: true }));
}

function generateTVRecommendationsFallback(userTV) {
  if (!userTV || userTV.length === 0) {
    return [];
  }

  const genreCounts = {};
  userTV.forEach(tv => {
    if (tv.genre) {
      genreCounts[tv.genre] = (genreCounts[tv.genre] || 0) + 1;
    }
  });

  const topGenre = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  const genreBasedTV = {
    'Action': [
      { title: 'Fallout', year: 2024, genre: 'Action', explanation: 'Gripping post-apocalyptic adventure', confidence: 9 },
      { title: 'Shogun', year: 2024, genre: 'Action', explanation: 'Epic historical drama with stunning production', confidence: 9 }
    ],
    'Comedy': [
      { title: 'The Bear', year: 2022, genre: 'Comedy', explanation: 'Intense workplace comedy with incredible depth', confidence: 9 },
      { title: 'Abbott Elementary', year: 2021, genre: 'Comedy', explanation: 'Heartwarming mockumentary about teaching', confidence: 8 }
    ],
    'Drama': [
      { title: 'Succession', year: 2018, genre: 'Drama', explanation: 'Brilliant family drama with sharp writing', confidence: 10 },
      { title: 'The Last of Us', year: 2023, genre: 'Drama', explanation: 'Emotional post-apocalyptic journey', confidence: 9 }
    ],
    'Sci-Fi': [
      { title: 'Severance', year: 2022, genre: 'Sci-Fi', explanation: 'Mind-bending workplace thriller', confidence: 9 },
      { title: '3 Body Problem', year: 2024, genre: 'Sci-Fi', explanation: 'Complex sci-fi adaptation', confidence: 8 }
    ],
    'Horror': [
      { title: 'Yellowjackets', year: 2021, genre: 'Horror', explanation: 'Psychological horror with survival mystery', confidence: 8 },
      { title: 'The Last of Us', year: 2023, genre: 'Horror', explanation: 'Emotional horror masterpiece', confidence: 9 }
    ]
  };

  const recommendations = genreBasedTV[topGenre] || [
    { title: 'True Detective', year: 2014, genre: 'Drama', explanation: 'Atmospheric crime anthology', confidence: 8 },
    { title: 'Black Mirror', year: 2011, genre: 'Sci-Fi', explanation: 'Thought-provoking tech anthology', confidence: 8 }
  ];

  return recommendations.map(rec => ({ ...rec, type: 'similar', contentType: 'tv', cached: true }));
}

module.exports = router;
