import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Server-safe Supabase client used inside Server Components and
 * Server Actions. Reads/writes the auth cookie store so session
 * handling stays consistent with the @supabase/ssr middleware.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component context that cannot write
          // cookies (e.g. during static rendering). Safe to ignore;
          // the middleware handles session refresh on navigation.
        }
      },
    },
  });
}