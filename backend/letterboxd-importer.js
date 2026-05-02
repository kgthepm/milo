const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const db = require('./database');

async function parseLetterboxdCSV(csvPath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

async function processLetterboxdImport(csvData, skipDatabase = false) {
  const moviesToImport = [];
  const skippedNoRating = [];
  const duplicates = [];
  let totalInCSV = csvData.length;

  for (const row of csvData) {
    const { Name, Rating, Date, Year } = row;

    if (!Rating || Rating.trim() === '') {
      skippedNoRating.push({ title: Name, reason: 'No rating' });
      continue;
    }

    const rating = parseFloat(Rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      skippedNoRating.push({ title: Name, reason: 'Invalid rating' });
      continue;
    }

    const convertedRating = rating * 2;

    const movieData = {
      title: Name,
      rating: convertedRating,
      date_watched: Date || null,
      type: 'movie',
      notes: '',
      genre: '',
      director: ''
    };

    if (!skipDatabase) {
      const existingMovie = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM movies WHERE title = ? AND type = ?', [Name, 'movie'], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (existingMovie) {
        duplicates.push({ title: Name, reason: 'Duplicate' });
        continue;
      }
    }

    moviesToImport.push(movieData);
  }

  return {
    totalInCSV,
    skippedNoRating: skippedNoRating.length,
    duplicates: duplicates.length,
    toImport: moviesToImport.length,
    preview: moviesToImport.slice(0, 5),
    allMovies: moviesToImport
  };
}

async function importMovies(movies) {
  const insertPromises = movies.map(movie => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO movies (title, rating, genre, date_watched, notes, director, type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      db.run(query, [movie.title, movie.rating, movie.genre, movie.date_watched, movie.notes, movie.director, movie.type], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  });

  return Promise.all(insertPromises);
}

module.exports = {
  parseLetterboxdCSV,
  processLetterboxdImport,
  importMovies
};
