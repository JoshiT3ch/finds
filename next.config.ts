import type { NextConfig } from "next";

function getSupabaseHostname() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return undefined;
  }

  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return undefined;
  }
}

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
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
