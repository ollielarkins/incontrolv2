-- InControl: career applications (CRM)
-- Run once in Supabase dashboard → SQL Editor. Safe to re-run.

create table if not exists public.applications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  title        text not null,
  company      text,
  status       text not null default 'planned',
  applied_on   date,
  follow_up_on date,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists applications_user_id_idx on public.applications (user_id);

alter table public.applications enable row level security;

drop policy if exists "Applications selectable by owner" on public.applications;
create policy "Applications selectable by owner"
  on public.applications for select using (auth.uid() = user_id);

drop policy if exists "Applications insertable by owner" on public.applications;
create policy "Applications insertable by owner"
  on public.applications for insert with check (auth.uid() = user_id);

drop policy if exists "Applications updatable by owner" on public.applications;
create policy "Applications updatable by owner"
  on public.applications for update using (auth.uid() = user_id);

drop policy if exists "Applications deletable by owner" on public.applications;
create policy "Applications deletable by owner"
  on public.applications for delete using (auth.uid() = user_id);
