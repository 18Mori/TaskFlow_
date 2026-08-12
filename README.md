# Apex Tasks

> A high-end, minimalist task orchestration engine built with Next.js, Tailwind CSS, and Supabase.

Apex Tasks is a dark-mode-first, keyboard-driven task workspace in the tradition of Vercel and Linear — not another generic AI-template dashboard. It pairs an ultra-thin `border-zinc-800` design language with a deeply engineered data layer: optimistic state sync, batch-safe server actions, Row Level Security, and zero-looped UI updates.

## Design Philosophy

- **Dark mode first.** Deep charcoal surfaces (`#09090b`, `#18181b`, `#27272a`) with high-contrast `zinc-100` text and whisper-quiet dividers.
- **Ultra-thin borders, not heavy shadows.** Micro-shadows and glassmorphism only appear where they earn it (floating batch toolbar, sliding panels).
- **Zero generic AI bloat.** No indigo/violet primary elements. Accent colors are reserved for semantic meaning: emerald (complete), amber (in progress), rose (danger), sky (info).
- **Micro-responsiveness.** The same markup collapses from a semantic data table on desktop to a touch-first card list on mobile with no layout duplication.
- **Deliberate motion.** `cubic-bezier(0.16, 1, 0.3, 1)` springs on drawers, dialogs, and the floating toolbar; `active:scale-[0.98]` gives every interaction tactile feedback.

## Key Features

| Feature | Description |
| --- | --- |
| **Deep-level task descriptions** | Auto-resizing, markdown-friendly notes field on every task; `line-clamp`-wrapped previews in the table so long notes never break alignment. |
| **Multi-row batch actions** | Check one or more rows to summon a floating glassmorphic toolbar — *Mark as completed*, *Soft delete*, *Restore* — backed by optimized `IN (…)` batch updates with instant optimistic state and a one-tap **Undo**. |
| **Custom geometric branding** | "The Apex Stack" isometric mark (`components/ui/AppLogo.tsx`) — three receding slabs in `currentColor` with a terminal emerald flow node. |
| **Custom-engineered toasts** | A stable external store with a frozen `getServerSnapshot` — notifications can never trigger an infinite re-render loop (see Architecture → Toasts). |
| **Zero-loop state syncing** | Optimistic local writes that reconcile against the server response and roll back cleanly on failure; the same data layer is ready to accept Supabase Realtime channel subscriptions. |
| **Secure JWT authentication** | Supabase Auth (JWTs in HTTP-only cookies) guarded at the edge by a Next.js `proxy.ts` middleware plus a `getUser()` check inside every Server Action, and enforced again at the row level by RLS. |
| **Micro-responsive layouts** | Desktop data table (sort, paginate, filter) collapses to a touch-first card list on mobile — `44×44px` hit areas, full-width CTAs, and iOS-safe tap handling. |
| **Keyboard-first UX** | `N` creates a task, `Esc` closes any panel, `Backspace` soft-deletes the current selection. Every shortcut is surfaced with a minimalist KBD badge. |

---

## Quick Start & Installation

### Prerequisites

- **Node.js** `20+` (Node `22` LTS recommended — `@supabase/supabase-js` deprecates Node ≤ 20)
- **npm** `10+` (or your package manager of choice)
- A **Supabase** account ([supabase.com](https://supabase.com)) — free tier is fine
- The **Supabase CLI** (optional — only needed for `supabase db push`. You can paste the SQL into the Dashboard instead.)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your Supabase project values:

```bash
cp .env.local.example .env.local
```

```ini
# Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

> **Security note.** Only the *public* anon key is ever shipped to the browser — the `service_role` secret key is never bundled. `lib/env.ts` validates these two variables at build time and crashes with a clear, actionable message if either is missing.

### 4. Provision the database

Run the migrations in order — ① base schema, ② auth & schema expansion:

**Option A — Supabase CLI** (recommended):

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

**Option B — SQL Editor:** open *Supabase Dashboard → SQL Editor* and paste the contents of each file in order:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_auth_and_schema_expansion.sql`

> The migrations are idempotent (`DROP POLICY IF EXISTS`, `ADD COLUMN IF NOT EXISTS`) and safe to re-run.

### 5. Run the development server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** — sign up for an account, and your workspace is live.

### Verify everything works

| Check | Command | Expected |
| --- | --- | --- |
| Lint | `npm run lint` | No errors |
| Type-check + build | `npm run build` | `✓ Compiled successfully`; proxy registered |
| Dev server | `npm run dev` | Ready on port `3000` (or next available) |

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server with Turbopack |
| `npm run build` | Production build (compiles + type-checks + runs the proxy bundling) |
| `npm start` | Serve the production build |
| `npm run lint` | Lint the codebase with ESLint (`eslint-config-next`) |

---

## Architecture

### Request flow

```
Browser
  │  NEXT_PUBLIC_ANON_KEY  (public, safe to expose)
  ▼
proxy.ts (Next.js 16 middleware)        ── refresh/rotate session cookies
  │                                         protect /tasks & /dashboard
  ▼
Server Actions / Server Components      ── requireSession() → getUser()
  │  Service-side Supabase client
  ▼
PostgREST (Supabase)                    ── Row Level Security → user_id = auth.uid()
```

### Technology map

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, proxy convention) |
| UI | React 19, Tailwind CSS v4, lucide-react |
| Backend | Supabase (Postgres + PostgREST + Auth), `@supabase/ssr` |
| Edge auth guard | `proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`) |
| State & data | Hand-rolled `useTasks` hook — optimistic updates with rollback |

### Project structure

```
├── app/
│   ├── page.tsx                    # Auth-aware premium landing page
│   ├── layout.tsx                  # Root layout: fonts, theme, <Toaster />
│   ├── tasks/page.tsx              # Protected dashboard route
│   ├── login/page.tsx              # Sign-in
│   ├── signup/page.tsx             # Sign-up (email confirmation)
│   └── auth/callback/route.ts      # OAuth / email-confirmation callback
├── components/
│   ├── ui/                         # Design system: Button, Checkbox, Badge,
│   │   │                           #   DataTable, DropdownMenu, SlideOver,
│   │   │                           #   Toast, Kbd, AppLogo, … (all headless-ready, themeable)
│   ├── features/tasks/             # Task Board, Table columns, Form, Edit panel, Filter bar
│   ├── auth/                       # AuthShell + login/signup forms
│   └── landing/                    # Demo board + scroll-reveal
├── lib/
│   ├── supabase/                   # server.ts, client.ts, middleware.ts (child client)
│   ├── auth/actions.ts             # signOut server action
│   ├── tasks/actions.ts           # 8 validated, session-guarded server actions
│   ├── tasks/use-tasks.ts        # optimistic data hook + rollback
│   ├── types.ts                    # Task, Column<T>, status/priority constants
│   └── env.ts                      # build-time env validation
├── proxy.ts                        # Edge auth guard (route protection)
└── supabase/migrations/
    ├── 0001_init.sql               # tasks table, RLS, updated_at trigger
    └── 0002_auth_and_schema_expansion.sql  # description col, ownership defaults, hardened RLS
```

### State sync model (the "zero-loop" guarantee)

Every write path follows the same discipline:

1. **Optimistic apply** — the hook updates local state immediately.
2. **Server reconcile** — the Server Action response replaces the optimistic row.
3. **Rollback** — on failure the hook re-fetches, restores truth, and raises a toast. Nothing is silently left mutated.

The toast system is the other half of "no loops": `Toaster` consumes a stable external store whose `getServerSnapshot` returns a **frozen module-level array** (`EMPTY_TOASTS`), so hydration and reconciliation can never produce render loops (see `components/ui/toast.tsx:44-55`).

**Supabase Realtime:** the data layer is deliberately decoupled from the transport — the same `useTasks` hook can subscribe to a `tasks` channel (`.on('postgres_changes', …)`) without touching the UI, leaving live multi-client sync as a drop-in enhancement.

### Toasts

`lib/`-independent notification primitives:

```ts
import { toast } from "@/components/ui/toast";

toast.success("Task updated.");
toast.success("3 tasks moved to recycling bin.", {
  action: { label: "Undo", onSelect: () => void bulkRestore([...ids]) },
});
toast.error("Failed to update tasks. Connection lost.");
```

---

## Database & Data Model

### `public.tasks`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | `PRIMARY KEY`, default `gen_random_uuid()` |
| `title` | `text` | `NOT NULL` |
| `description` | `text` | Nullable; detailed notes/markdown |
| `status` | `text` | `backlog` \| `in-progress` \| `completed` (CHECK-constrained) |
| `priority` | `text` | `low` \| `medium` \| `high` (CHECK-constrained) |
| `due_date` | `timestamptz` | Nullable |
| `is_deleted` | `boolean` | Soft-delete flag — `TRUE` rows live in the recycling bin |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Auto-maintained by a `BEFORE UPDATE` trigger |
| `user_id` | `uuid` | `REFERENCES auth.users(id) ON DELETE CASCADE`, default `auth.uid()` |

Indexed on `user_id`, `status`, `priority`, and `due_date`.

### Row Level Security

RLS is enabled and every policy is pinned to session ownership, so the database — not the client — is the last line of defense:

```sql
alter table public.tasks enable row level security;

create policy "Users can view their own tasks"
  on public.tasks for select to authenticated
  using (user_id = auth.uid());

create policy "Users can create their own tasks"
  on public.tasks for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own tasks"
  on public.tasks for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can delete their own tasks"
  on public.tasks for delete to authenticated
  using (user_id = auth.uid());
```

`user_id` defaults to `auth.uid()` at insert, so the Server Actions never need to set it, and table grants are limited to the `authenticated` role. The legacy open `anon` development policies shipped in `0001_init.sql` are **dropped** in migration `0002`.

> **Migrating pre-auth data.** Rows created before `0002` have `user_id IS NULL` and are invisible to users. To keep them, reassign once a user exists:

```sql
update public.tasks set user_id = (select id from auth.users limit 1)
where user_id is null;
```

---

## Authentication & Security

- **Edge gate (`proxy.ts`)** protects `/tasks` and `/dashboard`; unauthenticated visitors are redirected to `/login` (preserving the intended destination via `?next=`). Signed-in users are bounced away from `/login` and `/signup` back to `/tasks`.
- **Server Actions** call `getUser()` on every mutation — a cookie/session is not trusted by itself.
- **Input validation** rejects malformed rows before they reach Postgres (title required, strict status/priority enums, valid ISO dates).
- **RLS** (above) is the final, non-bypassable ownership check.
- The auth cookie is refreshed transparently during `proxy.ts` (`@supabase/ssr` token rotation), so sessions survive past access-token expiry.

### Auth flow

1. User signs up at `/signup` (email + password, `≥ 8` characters, confirmed).
2. Supabase emails a confirmation link that points to `/auth/callback?next=/tasks`.
3. `auth/callback/route.ts` exchanges the code for a session and redirects into the workspace.
4. Every subsequent request is authenticated by the cookie-based session chain above.

---

## Interactions & Ergonomics

| Touch | Action |
| --- | --- |
| **`N`** | Open the "New task" drawer |
| **`Esc`** | Close the active drawer / dialog / contextual menu |
| **`Backspace`** | Soft-delete the currently selected rows (with Undo) |
| Row checkbox / tap | Toggle a single row's selection |
| Floating toolbar | Bulk **Complete**, **Delete**, **Restore**, or **Clear** (`Esc`) |

Additional niceties:

- Header checkbox selects/deselects the current page (indeterminate between page selections).
- Column headers sort (`due date` is the default); search + priority/status filters stack.
- A live emerald **progress bar** reports `% completed` across the active workspace.
- On mobile (< `md`) the table becomes a card list, showing only checkbox → title/status → actions, with `44px+` tap targets and full-width CTAs.

---

## Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

1. Add the two `NEXT_PUBLIC_*` environment variables (Project → Settings → Environment Variables).
2. Deploy. `proxy.ts` is bundled automatically by Next.js 16 as the platform's edge middleware.
3. Keep the database schema in sync in CI — `supabase db push` (or the SQL Editor) after each migration lands.

### Any Node host

```bash
npm run build
npm start
```

Serve over HTTPS — Supabase session cookies are scoped to `Secure` origins.

---

## Common Issues

| Symptom | Cause / Fix |
| --- | --- |
| `[Taskflow] Missing environment variable: …` | `.env.local` is incomplete; see Quick Start step 3 |
| `Could not find the table 'public.tasks' in the schema cache` | The `GRANT … USAGE ON SCHEMA public` from `0001` is missing or migrations weren't applied |
| Tasks invisible after upgrading | Rows predate `0002` and have `user_id IS NULL`; run the re-assignment SQL in Database & Data Model |
| Snapshot/share requests to URL refused | `NEXT_PUBLIC_SUPABASE_URL` must be `https://your-project-ref.supabase.co` without a trailing slash |

---

## Contributing

1. `npm install`
2. Create a feature branch and keep commits focused.
3. Preserve the design system — prefer extending `components/ui/` over bespoke styles.
4. Gate every pull request on `npm run lint` and `npm run build`.

## License

`MIT` — see the `LICENSE` file (add it before your first public release).