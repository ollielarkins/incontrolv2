-- InControl: finance transactions
-- Run once in Supabase dashboard → SQL Editor. Safe to re-run.

create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  kind        text not null default 'expense', -- 'income' | 'expense'
  amount      numeric(12, 2) not null default 0,
  category    text,
  description text,
  occurred_on date not null default current_date,
  recurring   boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions (user_id);

alter table public.transactions enable row level security;

drop policy if exists "Transactions selectable by owner" on public.transactions;
create policy "Transactions selectable by owner"
  on public.transactions for select using (auth.uid() = user_id);

drop policy if exists "Transactions insertable by owner" on public.transactions;
create policy "Transactions insertable by owner"
  on public.transactions for insert with check (auth.uid() = user_id);

drop policy if exists "Transactions updatable by owner" on public.transactions;
create policy "Transactions updatable by owner"
  on public.transactions for update using (auth.uid() = user_id);

drop policy if exists "Transactions deletable by owner" on public.transactions;
create policy "Transactions deletable by owner"
  on public.transactions for delete using (auth.uid() = user_id);
