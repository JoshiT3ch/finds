import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  requireSupabasePublicConfig,
  supabaseCookieOptions,
} from "./config";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = requireSupabasePublicConfig();

  return createServerClient(
    url,
    publishableKey,
    {
      auth: {
        flowType: "pkce",
      },
      cookieOptions: supabaseCookieOptions,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components can read cookies, but cookie writes happen in actions or route handlers.
          }
        },
      },
    },
  );
}
