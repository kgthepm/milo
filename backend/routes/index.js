const express = require('express');
const db = require('../database');

const router = express.Router();

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
  const { title, rating, genre, date_watched, notes, director, type, num_seasons, total_episodes } = req.body;

  if (!title || !rating) {
    res.status(400).json({ error: 'Title and rating are required' });
    return;
  }

  if (rating < 1 || rating > 10) {
    res.status(400).json({ error: 'Rating must be between 1 and 10' });
    return;
  }

  const query = `
    INSERT INTO movies (title, rating, genre, date_watched, notes, director, type, num_seasons, total_episodes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [title, rating, genre, date_watched, notes, director, type || 'movie', num_seasons, total_episodes], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, title, rating, genre, date_watched, notes, director, type: type || 'movie', num_seasons, total_episodes });
  });
});

router.put('/movies/:id', (req, res) => {
  const { title, rating, genre, date_watched, notes, director, type, num_seasons, total_episodes } = req.body;
  const { id } = req.params;

  if (!title || !rating) {
    res.status(400).json({ error: 'Title and rating are required' });
    return;
  }

  if (rating < 1 || rating > 10) {
    res.status(400).json({ error: 'Rating must be between 1 and 10' });
    return;
  }

  const query = `
    UPDATE movies
    SET title = ?, rating = ?, genre = ?, date_watched = ?, notes = ?, director = ?, type = ?, num_seasons = ?, total_episodes = ?
    WHERE id = ?
  `;

  db.run(query, [title, rating, genre, date_watched, notes, director, type || 'movie', num_seasons, total_episodes, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }
    res.json({ id, title, rating, genre, date_watched, notes, director, type: type || 'movie', num_seasons, total_episodes });
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
      avgRating: avgRating[0].avg_rating ? Math.round(avgRating[0].avg_rating * 100) / 100 : 0,
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

  if (!title || !rating) {
    res.status(400).json({ error: 'Title and rating are required' });
    return;
  }

  if (rating < 1 || rating > 10) {
    res.status(400).json({ error: 'Rating must be between 1 and 10' });
    return;
  }

  const query = `
    INSERT INTO movies (title, rating, genre, date_watched, notes, type, num_seasons, total_episodes)
    VALUES (?, ?, ?, ?, ?, 'tv', ?, ?)
  `;

  db.run(query, [title, rating, genre, date_watched, notes, num_seasons, total_episodes], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, title, rating, genre, date_watched, notes, type: 'tv', num_seasons, total_episodes });
  });
});

router.put('/tv/:id', (req, res) => {
  const { title, rating, genre, date_watched, notes, num_seasons, total_episodes } = req.body;
  const { id } = req.params;

  if (!title || !rating) {
    res.status(400).json({ error: 'Title and rating are required' });
    return;
  }

  if (rating < 1 || rating > 10) {
    res.status(400).json({ error: 'Rating must be between 1 and 10' });
    return;
  }

  const query = `
    UPDATE movies
    SET title = ?, rating = ?, genre = ?, date_watched = ?, notes = ?, type = 'tv', num_seasons = ?, total_episodes = ?
    WHERE id = ? AND type = 'tv'
  `;

  db.run(query, [title, rating, genre, date_watched, notes, num_seasons, total_episodes, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'TV series not found' });
      return;
    }
    res.json({ id, title, rating, genre, date_watched, notes, type: 'tv', num_seasons, total_episodes });
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
      avgRating: avgRating[0].avg_rating ? Math.round(avgRating[0].avg_rating * 100) / 100 : 0,
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

module.exports = router;