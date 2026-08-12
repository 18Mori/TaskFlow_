-- ============================================================
-- Taskflow · Migration 0002 — Auth + schema expansion
-- Adds the `description` column, ties ownership to the session,
-- and hardens Row Level Security so users only ever touch their
-- own tasks.
-- Requires migration 0001 (tasks table with `user_id` FK).
-- ============================================================

-- ------------------------------------------------------------
-- 1. New column: `description` (nullable task notes)
-- ------------------------------------------------------------
alter table public.tasks
  add column if not exists description text;

comment on column public.tasks.description is
  'Optional detailed notes/markdown for a task.';

-- ------------------------------------------------------------
-- 2. Ownership default: new tasks belong to the creator.
--    `auth.uid()` resolves to the caller within a Supabase
--    (PostgREST) authenticated request; the server actions omit
--    `user_id` so this default applies.
-- ------------------------------------------------------------
alter table public.tasks
  alter column user_id set default auth.uid();

-- ------------------------------------------------------------
-- 3. Tighten table grants.
--    The app now requires authentication, so drop the open `anon`
--    table privileges (the schema usage grant stays — it is
--    needed for auth endpoints). Only signed-in users can touch
--    `tasks`, and RLS further restricts rows to the owner.
-- ------------------------------------------------------------
revoke all on public.tasks from anon;
grant select, insert, update, delete on public.tasks to authenticated;

-- ------------------------------------------------------------
-- 4. Replace RLS policies — enforce `user_id = auth.uid()`.
--    `DROP ... IF EXISTS` keeps this idempotent (PostgreSQL does
--    not support `CREATE POLICY IF NOT EXISTS`).
-- ------------------------------------------------------------

-- Authenticated ownership policies
drop policy if exists "Users can view their own tasks" on public.tasks;
create policy "Users can view their own tasks"
  on public.tasks for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can create their own tasks" on public.tasks;
create policy "Users can create their own tasks"
  on public.tasks for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update their own tasks" on public.tasks;
create policy "Users can update their own tasks"
  on public.tasks for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete their own tasks" on public.tasks;
create policy "Users can delete their own tasks"
  on public.tasks for delete
  to authenticated
  using (user_id = auth.uid());

-- Legacy open development policies — removed now that auth is live.
drop policy if exists "Public read access for testing" on public.tasks;
drop policy if exists "Public insert access for testing" on public.tasks;
drop policy if exists "Public update access for testing" on public.tasks;
drop policy if exists "Public delete access for testing" on public.tasks;

-- ------------------------------------------------------------
-- 5. Note for existing data.
--    Rows created before this migration have `user_id IS NULL` and
--    are now invisible to every user. If you want to keep them,
--    reassign them to a specific user (run in SQL Editor once a
--    user exists) — e.g.:
--
--    update public.tasks set user_id = (select id from auth.users limit 1)
--    where user_id is null;
-- ------------------------------------------------------------