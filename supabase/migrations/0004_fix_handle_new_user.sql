-- Make the signup trigger bulletproof.
-- - Pin search_path so `profiles` always resolves under security definer.
-- - Fully qualify the table.
-- - Try to claim the requested username, but if it's taken (or anything else
--   goes wrong) fall back to inserting the profile row with a NULL username
--   so the auth.users insert always succeeds. The user can set/change their
--   username afterwards from the app.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  requested_username text := nullif(new.raw_user_meta_data->>'username', '');
begin
  begin
    insert into public.profiles (id, username)
    values (new.id, requested_username)
    on conflict (id) do nothing;
  exception
    when unique_violation then
      insert into public.profiles (id)
      values (new.id)
      on conflict (id) do nothing;
    when others then
      insert into public.profiles (id)
      values (new.id)
      on conflict (id) do nothing;
  end;
  return new;
end;
$$;
