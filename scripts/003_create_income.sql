-- Create income table for tracking income
create table if not exists public.income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  source text not null,
  date date not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.income enable row level security;

-- RLS Policies for income
create policy "income_select_own"
  on public.income for select
  using (auth.uid() = user_id);

create policy "income_insert_own"
  on public.income for insert
  with check (auth.uid() = user_id);

create policy "income_update_own"
  on public.income for update
  using (auth.uid() = user_id);

create policy "income_delete_own"
  on public.income for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists income_user_id_idx on public.income(user_id);
create index if not exists income_date_idx on public.income(date);
