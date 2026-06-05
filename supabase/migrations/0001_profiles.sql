-- InControl: profiles table + onboarding gate
-- Run this once in the Supabase dashboard → SQL Editor → New query → Run.
-- It is safe to re-run (idempotent).

create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  onboarded      boolean     not null default false,
  identity       text,
  directions     text[]      not null default '{}',
  goals          jsonb       not null default '[]'::jsonb,
  weekly_hours   integer,
  target_role    text,
  target_horizon text,
  integrations   text[]      not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Row Level Security: a user may only see/write their own row.
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create an (un-onboarded) profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill rows for any users that already existed before this migration.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
