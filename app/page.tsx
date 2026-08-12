import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Keyboard, Zap } from "lucide-react";
import { AppLogo } from "@/components/ui/AppLogo";
import { Reveal } from "@/components/landing/reveal";
import { DemoBoard } from "@/components/landing/demo-board";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Taskflow — Focus on what matters. Fast.",
  description:
    "A minimalist task workspace that keeps you moving. Keyboard-first, blazing fast, beautifully quiet.",
};

const FEATURES = [
  {
    title: "Blazing fast",
    body: "Optimistic UI and instant interactions mean your to-dos keep up with your pace.",
    icon: <Zap aria-hidden="true" className="size-4" />,
  },
  {
    title: "Keyboard-first",
    body: "Create, complete, and clean up tasks without ever leaving your keyboard.",
    icon: <Keyboard aria-hidden="true" className="size-4" />,
  },
  {
    title: "Quietly focused",
    body: "No noise, no clutter. Just a calm, high-contrast workspace that gets out of your way.",
    icon: <CheckCircle2 aria-hidden="true" className="size-4" />,
  },
];

const KBD_ROWS = [
  { keys: ["N"], label: "New task" },
  { keys: ["Esc"], label: "Close panel" },
  { keys: ["⌫"], label: "Delete selected" },
];

export default async function Home() {
  let signedIn = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);
  } catch {
    signedIn = false;
  }

  const workspaceLink = (
    <Link
      href="/tasks"
      className="inline-flex h-11 items-center gap-2 rounded-lg bg-zinc-100 px-6 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/20 transition-all duration-150 hover:bg-white hover:shadow-zinc-700/20 active:scale-95"
    >
      Open your workspace
      <ArrowRight aria-hidden="true" className="size-4" />
    </Link>
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(39,39,42,0.55),#09090b_60%)]" />
        <div className="bg-grid absolute inset-x-0 top-0 h-[700px]" />
        <div className="hero-glow absolute inset-x-0 top-0 h-[560px] animate-pulse-glow" />
      </div>

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-zinc-200 transition-colors duration-150 hover:text-zinc-100"
        >
          <AppLogo size={24} />
          <span className="text-base font-semibold tracking-tight">Taskflow</span>
        </Link>
        <div className="flex items-center gap-2">
          {signedIn ? (
            <Link
              href="/tasks"
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-zinc-100 px-3.5 text-sm font-medium text-zinc-950 transition-transform duration-150 hover:bg-white active:scale-95"
            >
              Open workspace
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors duration-150 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-zinc-100 px-3.5 text-sm font-medium text-zinc-950 transition-transform duration-150 hover:bg-white active:scale-95"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <section className="mx-auto max-w-3xl pt-24 text-center sm:pt-32">
          <div className="animate-rise mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-400 backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Built for people who ship
          </div>

          <h1 className="animate-rise font-sans text-5xl font-semibold tracking-tighter text-zinc-50 [animation-delay:60ms] sm:text-7xl">
            Focus on what
            <br />
            matters. Fast.
          </h1>

          <p className="animate-rise mx-auto mt-6 max-w-xl text-lg leading-7 text-zinc-400 [animation-delay:120ms]">
            A minimalist task workspace that stays out of your way. Keyboard-first,
            optimistic, silent — so the work speaks.
          </p>

          <div className="animate-rise mt-10 flex flex-wrap items-center justify-center gap-3 [animation-delay:180ms]">
            {signedIn ? (
              workspaceLink
            ) : (
              <>
                <Link
                  href="/signup"
                  className="btn-shimmer inline-flex h-11 items-center gap-2 rounded-lg bg-zinc-100 px-6 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/20 transition-all duration-150 hover:bg-white hover:shadow-zinc-700/20 active:scale-95"
                >
                  Get Started for Free
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-6 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all duration-150 hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-zinc-100 active:scale-95"
                >
                  Sign in to your workspace
                </Link>
              </>
            )}
          </div>

          <div className="animate-rise mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 [animation-delay:240ms]">
            {KBD_ROWS.map((row) => (
              <div key={row.label} className="flex items-center gap-2 text-xs text-zinc-500">
                {row.keys.map((key) => (
                  <kbd
                    key={key}
                    className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-zinc-700/80 bg-zinc-800/60 px-1.5 font-mono text-[10px] font-medium text-zinc-300"
                  >
                    {key}
                  </kbd>
                ))}
                {row.label}
              </div>
            ))}
          </div>
        </section>

        <Reveal className="mx-auto mt-24 max-w-4xl">
          <DemoBoard />
        </Reveal>

        <section className="mx-auto mt-28 max-w-5xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 80}>
                <div className="group h-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/30">
                  <div className="mb-4 inline-flex size-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors duration-200 group-hover:border-zinc-700 group-hover:text-zinc-200">
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-semibold tracking-tight text-zinc-100">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {feature.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-28 max-w-3xl text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tighter text-zinc-50 sm:text-4xl">
              Your ideas deserve a quiet place to land.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-zinc-500">
              Set up your workspace in under a minute. Free forever for your first
              project.
            </p>
            <div className="mt-8">
              {signedIn ? (
                workspaceLink
              ) : (
                <Link
                  href="/signup"
                  className="btn-shimmer inline-flex h-11 items-center gap-2 rounded-lg bg-zinc-100 px-6 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/20 transition-all duration-150 hover:bg-white active:scale-95"
                >
                  Start building
                </Link>
              )}
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="relative z-10 border-t border-zinc-800/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <div className="flex items-center gap-2 text-zinc-500">
            <AppLogo size={18} className="text-zinc-500" />
            <span className="text-xs font-medium">Taskflow</span>
          </div>
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Taskflow. Calm by design.
          </p>
        </div>
      </footer>
    </div>
  );
}