-- ============================================================
-- Taskflow · Initial migration
-- Creates the `tasks` table with soft-delete support,
-- an `updated_at` trigger, and Row Level Security.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tasks table
-- ------------------------------------------------------------
create table if not exists public.tasks (
  id         uuid        primary key default gen_random_uuid(),
  title      text        not null,
  status     text        not null default 'backlog'
    check (status in ('backlog', 'in-progress', 'completed')),
  priority   text        not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  due_date   timestamptz,
  is_deleted boolean     not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id    uuid        references auth.users (id) on delete cascade
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_priority_idx on public.tasks (priority);
create index if not exists tasks_due_date_idx on public.tasks (due_date);

comment on column public.tasks.is_deleted is
  'Soft-delete flag. True rows live in the recycling bin.';
comment on column public.tasks.user_id is
  'Owner of the task. Nullable while single-user/testing; enforced by RLS for authenticated users.';

-- ------------------------------------------------------------
-- 2. Automatic `updated_at` trigger
-- ------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.handle_updated_at();

-- ------------------------------------------------------------
-- 3. Row Level Security
-- ------------------------------------------------------------
alter table public.tasks enable row level security;

-- Authenticated policies: users only touch their own tasks.
-- Wire `user_id` to `auth.uid()` at insert time once authentication is enabled.

create policy "Users can view their own tasks"
  on public.tasks for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own tasks"
  on public.tasks for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4. Fallback public/anon policies (for local development &
--    testing before authentication is wired up).
--    COMMENT OUT these four policies in production: they grant
--    full read/write access to anyone using the anon key.
--    The RLS-protected policies above still apply once a user
--    is signed in and `user_id` is populated.
-- ------------------------------------------------------------
create policy "Public read access for testing"
  on public.tasks for select
  to anon
  using (true);

create policy "Public insert access for testing"
  on public.tasks for insert
  to anon
  with check (true);

create policy "Public update access for testing"
  on public.tasks for update
  to anon
  using (true)
  with check (true);

create policy "Public delete access for testing"
  on public.tasks for delete
  to anon
  using (true);

-- ------------------------------------------------------------
-- 5. Optional seeding guard — disabled by default.
--    Uncomment to seed a couple of rows for a blank workspace
--    during development.
-- ------------------------------------------------------------
-- insert into public.tasks (title, status, priority, due_date)
-- values
--   ('Review Q3 roadmap', 'in-progress', 'high', now() + interval '3 days'),
--   ('Polish onboarding copy', 'backlog', 'medium', now() + interval '7 days');