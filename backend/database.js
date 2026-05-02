const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'movies.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      rating REAL CHECK(rating IS NULL OR (rating >= 1 AND rating <= 10)),
      genre TEXT,
      date_watched TEXT,
      notes TEXT,
      director TEXT,
      release_year INTEGER,
      type TEXT DEFAULT 'movie',
      num_seasons INTEGER,
      total_episodes INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Movies table ready');
      migrateDatabase();
    }
  });
}

function migrateDatabase() {
  db.all("PRAGMA table_info(movies)", [], (err, columns) => {
    if (err) {
      console.error('Error checking table columns:', err.message);
      return;
    }

    const columnNames = columns.map(col => col.name);
    const ratingColumn = columns.find(col => col.name === 'rating');
    const needsMigration = !columnNames.includes('director') ||
                          (ratingColumn && (ratingColumn.type === 'INTEGER' || ratingColumn.notnull)) ||
                          !columnNames.includes('release_year') ||
                          !columnNames.includes('type') ||
                          !columnNames.includes('num_seasons') ||
                          !columnNames.includes('total_episodes');

    const checkDateWatchedConstraint = (callback) => {
      db.run("INSERT INTO movies (title, rating, date_watched) VALUES ('_migration_test', 1, NULL)", function(err) {
        if (err) {
          if (err.message.includes('NOT NULL')) {
            callback(true);
          } else {
            callback(false);
          }
        } else {
          db.run("DELETE FROM movies WHERE title = '_migration_test'", () => {
            callback(false);
          });
        }
      });
    };

    checkDateWatchedConstraint((hasNotNullConstraint) => {
      if (needsMigration || hasNotNullConstraint) {
        console.log('Running database migration...');

        db.run('DROP TABLE IF EXISTS movies_new', (err) => {
          if (err) {
            console.error('Error dropping existing movies_new table:', err.message);
            return;
          }

          db.run(`
            CREATE TABLE movies_new (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT NOT NULL,
              rating REAL CHECK(rating IS NULL OR (rating >= 1 AND rating <= 10)),
              genre TEXT,
              date_watched TEXT,
              notes TEXT,
              director TEXT,
              release_year INTEGER,
              type TEXT DEFAULT 'movie',
              num_seasons INTEGER,
              total_episodes INTEGER,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (err) => {
            if (err) {
              console.error('Error creating new table:', err.message);
              return;
            }

            const selectColumn = (columnName, fallbackValue) => (
              columnNames.includes(columnName)
                ? columnName
                : `${fallbackValue} AS ${columnName}`
            );

            const selectRatingColumn = columnNames.includes('rating')
              ? "CASE WHEN rating >= 1 AND rating <= 10 THEN rating ELSE NULL END AS rating"
              : 'NULL AS rating';

            db.run(`
              INSERT INTO movies_new (id, title, rating, genre, date_watched, notes, director, release_year, type, num_seasons, total_episodes, created_at)
              SELECT
                ${selectColumn('id', 'NULL')},
                ${selectColumn('title', "''")},
                ${selectRatingColumn},
                ${selectColumn('genre', 'NULL')},
                ${selectColumn('date_watched', 'NULL')},
                ${selectColumn('notes', 'NULL')},
                ${selectColumn('director', 'NULL')},
                ${selectColumn('release_year', 'NULL')},
                ${selectColumn('type', "'movie'")},
                ${selectColumn('num_seasons', 'NULL')},
                ${selectColumn('total_episodes', 'NULL')},
                ${selectColumn('created_at', 'CURRENT_TIMESTAMP')}
              FROM movies
            `, (err) => {
              if (err) {
                console.error('Error copying data:', err.message);
                return;
              }

              db.run('DROP TABLE movies', (err) => {
                if (err) {
                  console.error('Error dropping old table:', err.message);
                  return;
                }

                db.run('ALTER TABLE movies_new RENAME TO movies', (err) => {
                  if (err) {
                    console.error('Error renaming table:', err.message);
                  } else {
                    console.log('Database migration completed successfully');
                  }
                });
              });
            });
          });
        });
      }
    });
  });
}

module.exports = db;
