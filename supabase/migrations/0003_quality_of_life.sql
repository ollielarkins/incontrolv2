-- InControl: quality of life (one row per user)
-- Run once in Supabase dashboard → SQL Editor. Safe to re-run.

create table if not exists public.quality_of_life (
  id          uuid primary key references auth.users (id) on delete cascade,
  daily_focus text        not null default '',
  schedule    jsonb       not null default '[]'::jsonb,
  notes       text        not null default '',
  todos       jsonb       not null default '[]'::jsonb,
  bookmarks   jsonb       not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.quality_of_life enable row level security;

drop policy if exists "QoL selectable by owner" on public.quality_of_life;
create policy "QoL selectable by owner"
  on public.quality_of_life for select using (auth.uid() = id);

drop policy if exists "QoL insertable by owner" on public.quality_of_life;
create policy "QoL insertable by owner"
  on public.quality_of_life for insert with check (auth.uid() = id);

drop policy if exists "QoL updatable by owner" on public.quality_of_life;
create policy "QoL updatable by owner"
  on public.quality_of_life for update using (auth.uid() = id);
