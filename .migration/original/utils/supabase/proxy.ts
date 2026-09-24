import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  getSupabasePublicConfig,
  supabaseCookieOptions,
} from "./config";

const AUTH_CALLBACK_PATHS = new Set(["/auth/confirm"]);
const AUTH_MUTATING_POST_PATHS = new Set([
  "/account",
  "/forgot-password",
  "/login",
  "/signup",
  "/update-password",
]);

function shouldSkipSessionRefresh(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (AUTH_CALLBACK_PATHS.has(pathname)) {
    return true;
  }

  return request.method === "POST" && AUTH_MUTATING_POST_PATHS.has(pathname);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const config = getSupabasePublicConfig();

  if (!config || shouldSkipSessionRefresh(request)) {
    return response;
  }

  const supabase = createServerClient(config.url, config.publishableKey, {
    auth: {
      flowType: "pkce",
    },
    cookieOptions: supabaseCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headersToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headersToSet).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  try {
    await supabase.auth.getClaims();
  } catch {
    return response;
  }

  return response;
}
