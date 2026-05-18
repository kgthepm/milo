#!/usr/bin/env node
/**
 * One-shot migration: SQLite (movies.db) → Supabase Postgres.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/migrate-sqlite-to-supabase.js --user-id <your-auth-uid> [--db ./movies.db] [--dry]
 *
 * Notes:
 * - Uses the Supabase service role key so RLS doesn't block the insert.
 * - Stamps every row with the supplied --user-id (your auth.users.id).
 * - Idempotent-ish: re-runs will create duplicates. Run against a fresh project,
 *   or truncate the table first.
 */

const path = require('path');
const sqlite3 = require(path.resolve(__dirname, '..', 'backend', 'node_modules', 'sqlite3'));
const { createClient } = require(path.resolve(__dirname, '..', 'backend', 'node_modules', '@supabase/supabase-js'));

function parseArgs(argv) {
  const args = { db: path.resolve(__dirname, '..', 'movies.db'), dry: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--user-id') args.userId = argv[++i];
    else if (a === '--db') args.db = path.resolve(argv[++i]);
    else if (a === '--dry') args.dry = true;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

  if (!args.userId) throw new Error('Missing --user-id <auth.users.id>');
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.');
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const db = new sqlite3.Database(args.db, sqlite3.OPEN_READONLY);

  const rows = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM movies', [], (err, r) => (err ? reject(err) : resolve(r)));
  });
  db.close();

  console.log(`Read ${rows.length} rows from ${args.db}`);

  const payload = rows.map((r) => ({
    user_id: args.userId,
    title: r.title,
    rating: r.rating,
    genre: r.genre || null,
    date_watched: r.date_watched || null,
    notes: r.notes || null,
    director: r.director || null,
    release_year: r.release_year || null,
    type: r.type || 'movie',
    num_seasons: r.num_seasons || null,
    total_episodes: r.total_episodes || null,
    created_at: r.created_at || undefined,
  }));

  if (args.dry) {
    console.log('--dry: skipping insert. Sample:', payload.slice(0, 3));
    return;
  }

  const chunkSize = 500;
  let inserted = 0;
  for (let i = 0; i < payload.length; i += chunkSize) {
    const chunk = payload.slice(i, i + chunkSize);
    const { error } = await sb.from('movies').insert(chunk);
    if (error) throw new Error(`Insert failed at chunk ${i}: ${error.message}`);
    inserted += chunk.length;
    console.log(`  inserted ${inserted}/${payload.length}`);
  }
  console.log(`Done. Inserted ${inserted} rows for user ${args.userId}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
