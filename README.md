# TaskFlow_

A high-end, minimalist task management workspace built with Next.js (App Router),
React 19, Tailwind CSS, and a production-ready Supabase backend.

## Stack

- **Next.js 16** (App Router, Server Actions)
- **React 19**
- **Tailwind CSS v4**
- **Supabase** (`@supabase/ssr`) with Row Level Security

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure Supabase:

   Create a Supabase project and run the migration
   at `supabase/migrations/0001_init.sql` (Dashboard → SQL Editor, or
   `supabase db push` if using the CLI).

3. Set up environment variables:

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in your values from Supabase Dashboard → Project Settings → API:

   ```ini
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```

   > The app validates these at build time and crashes with a clear error if
   > they are missing. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is public by design; a
   > secret `service_role` key is never used by the browser bundle.

4. Run the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Database & security

- **`tasks` table** with a `updated_at` trigger, soft-delete flag
  (`is_deleted`), and a nullable `user_id` linking to `auth.users` for future
  multi-tenant auth.
- **Row Level Security** is enabled. Signed-in users only read/write their own
  tasks. A documented **public/anon fallback** keeps local development simple
  while authentication is being wired up — comment it out before production.
- **Server Actions** authenticate every mutation and validate all inputs;
  ownership is enforced by RLS policies.

## Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the development server         |
| `npm run build`    | Production build                     |
| `npm run start`    | Serve the production build           |
| `npm run lint`     | Lint with ESLint                     |