-- The profiles table already exists (id, username unique, display_name,
-- avatar_url, created_at). This adds what was missing.

-- Usernames: 3–20 lowercase letters, numbers or underscores.
-- (`not valid` = only checked for new/edited rows, not existing ones.)
alter table public.profiles
  add constraint profiles_username_format
  check (username ~ '^[a-z0-9_]{3,20}$') not valid;

-- When someone signs up, create their profile from the username and
-- display_name the sign up form sent along. Runs inside Supabase, so it
-- works even before they confirm their email (when the app can't insert
-- the row itself because they aren't logged in yet).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    lower(new.raw_user_meta_data ->> 'username'),
    new.raw_user_meta_data ->> 'display_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
