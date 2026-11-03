import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase client for server code (route handlers, server components, server actions).
// Create a new one per request — don't share it between requests.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server components can't set cookies. Safe to ignore because
            // proxy.ts refreshes the session cookies on every request.
          }
        },
      },
    },
  );
}
