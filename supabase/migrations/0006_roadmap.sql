-- InControl: skill roadmap nodes
-- Run once in Supabase dashboard → SQL Editor. Safe to re-run.

create table if not exists public.roadmap_nodes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null default 'New node',
  status     text not null default 'unlocked',
  x          double precision not null default 0,
  y          double precision not null default 0,
  links      jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists roadmap_nodes_user_id_idx on public.roadmap_nodes (user_id);

alter table public.roadmap_nodes enable row level security;

drop policy if exists "Roadmap selectable by owner" on public.roadmap_nodes;
create policy "Roadmap selectable by owner"
  on public.roadmap_nodes for select using (auth.uid() = user_id);

drop policy if exists "Roadmap insertable by owner" on public.roadmap_nodes;
create policy "Roadmap insertable by owner"
  on public.roadmap_nodes for insert with check (auth.uid() = user_id);

drop policy if exists "Roadmap updatable by owner" on public.roadmap_nodes;
create policy "Roadmap updatable by owner"
  on public.roadmap_nodes for update using (auth.uid() = user_id);

drop policy if exists "Roadmap deletable by owner" on public.roadmap_nodes;
create policy "Roadmap deletable by owner"
  on public.roadmap_nodes for delete using (auth.uid() = user_id);
