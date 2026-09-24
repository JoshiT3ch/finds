import { createBrowserClient } from "@supabase/ssr";
import {
  requireSupabasePublicConfig,
  supabaseCookieOptions,
} from "./config";

export function createClient() {
  const { url, publishableKey } = requireSupabasePublicConfig();

  return createBrowserClient(
    url,
    publishableKey,
    {
      auth: {
        flowType: "pkce",
      },
      cookieOptions: supabaseCookieOptions,
    },
  );
}
