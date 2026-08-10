/**
 * Environment validation for Supabase.
 *
 * Importing this module immediately validates the required public
 * variables and crashes the process with a clear, professional error
 * message if any are missing. This runs at build time (Next.js inlines
 * `NEXT_PUBLIC_*` values into client bundles) and at runtime on both
 * the server and the browser.
 *
 * IMPORTANT: the variables are read via STATIC `process.env.NAME`
 * property access. Next.js/Turbopack only inlines `NEXT_PUBLIC_*`
 * values into the browser bundle for statically-analyzable references;
 * dynamic access like `process.env[name]` silently yields `undefined`
 * in the browser.
 */

type RequiredEnvVar = "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY";

function missing(name: RequiredEnvVar): never {
  throw new Error(
    `[Taskflow] Missing environment variable: ${name}.\n` +
      `Add it to your .env.local file. See .env.local.example or the README for details.\n` +
      `Required format: ${name}=<value>`
  );
}

function required(name: RequiredEnvVar, value: string | undefined): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return missing(name);
  }
  return value.trim();
}

export const env = {
  supabaseUrl: required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  ),
  supabaseAnonKey: required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
} as const;