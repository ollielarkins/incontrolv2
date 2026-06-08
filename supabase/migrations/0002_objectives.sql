-- InControl: objectives + subtasks
-- Run once in Supabase dashboard → SQL Editor. Safe to re-run.

create table if not exists public.objectives (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null,
  topic       text,
  category    text,
  due_date    date,
  linked_node text,
  subtasks    jsonb       not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists objectives_user_id_idx on public.objectives (user_id);

alter table public.objectives enable row level security;

drop policy if exists "Objectives selectable by owner" on public.objectives;
create policy "Objectives selectable by owner"
  on public.objectives for select using (auth.uid() = user_id);

drop policy if exists "Objectives insertable by owner" on public.objectives;
create policy "Objectives insertable by owner"
  on public.objectives for insert with check (auth.uid() = user_id);

drop policy if exists "Objectives updatable by owner" on public.objectives;
create policy "Objectives updatable by owner"
  on public.objectives for update using (auth.uid() = user_id);

drop policy if exists "Objectives deletable by owner" on public.objectives;
create policy "Objectives deletable by owner"
  on public.objectives for delete using (auth.uid() = user_id);
