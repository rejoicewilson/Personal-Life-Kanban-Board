create table if not exists public.categories (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  color text not null check (color in ('sky', 'violet', 'rose', 'emerald', 'amber', 'cyan')),
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  category_id text not null references public.categories(id) on delete restrict,
  status text not null check (status in ('todo', 'doing', 'done')),
  timestamp bigint not null,
  due_date bigint,
  reminder_enabled boolean not null default false,
  reminder_sent_at bigint,
  note text,
  subtasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute procedure public.set_updated_at();

drop trigger if exists push_subscriptions_set_updated_at on public.push_subscriptions;
create trigger push_subscriptions_set_updated_at
before update on public.push_subscriptions
for each row
execute procedure public.set_updated_at();

alter table public.categories enable row level security;
alter table public.tasks enable row level security;
alter table public.push_subscriptions enable row level security;

create policy if not exists "categories select own"
on public.categories
for select
using (auth.uid() = user_id);

create policy if not exists "categories insert own"
on public.categories
for insert
with check (auth.uid() = user_id);

create policy if not exists "categories update own"
on public.categories
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "categories delete own"
on public.categories
for delete
using (auth.uid() = user_id);

create policy if not exists "tasks select own"
on public.tasks
for select
using (auth.uid() = user_id);

create policy if not exists "tasks insert own"
on public.tasks
for insert
with check (auth.uid() = user_id);

create policy if not exists "tasks update own"
on public.tasks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "tasks delete own"
on public.tasks
for delete
using (auth.uid() = user_id);

drop policy if exists "push subscriptions select own" on public.push_subscriptions;
drop policy if exists "push subscriptions insert own" on public.push_subscriptions;
drop policy if exists "push subscriptions update own" on public.push_subscriptions;
drop policy if exists "push subscriptions delete own" on public.push_subscriptions;

create policy "push subscriptions select own"
on public.push_subscriptions
for select
using (auth.uid() = user_id);

create policy "push subscriptions insert own"
on public.push_subscriptions
for insert
with check (auth.uid() = user_id);

create policy "push subscriptions update own"
on public.push_subscriptions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "push subscriptions delete own"
on public.push_subscriptions
for delete
using (auth.uid() = user_id);
