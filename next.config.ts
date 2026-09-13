import type { NextConfig } from "next";
import { getSupabasePublicConfig } from "./utils/supabase/config";

function getSupabaseHostname(supabaseUrl: string | undefined) {
  if (!supabaseUrl) {
    return undefined;
  }

  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return undefined;
  }
}

const supabaseConfig = getSupabasePublicConfig();
const supabaseHostname = getSupabaseHostname(supabaseConfig?.url);

const nextConfig: NextConfig = {
  // Next.js does not expose VITE_* variables to browser code automatically.
  // Only the public Supabase URL and anon/publishable key belong here.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseConfig?.url ?? "",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: supabaseConfig?.publishableKey ?? "",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "26mb",
    },
  },
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            port: "",
            pathname: "/storage/v1/object/public/listing-images/**",
            search: "",
          },
        ]
      : [],
  },
};

export default nextConfig;
