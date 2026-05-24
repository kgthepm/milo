-- Extend handle_new_user() so the profile row picks up a username chosen at sign-up.
-- The username is passed via supabase.auth.signUp({ options: { data: { username } } })
-- which lands in auth.users.raw_user_meta_data. Uniqueness is enforced by the existing
-- unique constraint on profiles.username — a collision will fail the auth.users insert
-- and Supabase surfaces the error to the client.

create or replace function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, username)
  values (new.id, nullif(new.raw_user_meta_data->>'username', ''))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
