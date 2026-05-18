import { createClient } from '@supabase/supabase-js';
import { IS_CLOUD } from './mode';

let _client = null;

export function getSupabase() {
  if (!IS_CLOUD) return null;
  if (_client) return _client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Cloud mode requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Add them to .env.local or switch to VITE_MILO_MODE=local.'
    );
  }

  _client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return _client;
}
