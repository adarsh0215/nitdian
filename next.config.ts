// next.config.ts
import type { NextConfig } from "next";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://project-ref.supabase.co";
const SUPABASE_HOST = new URL(SUPABASE_URL).hostname;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: SUPABASE_HOST,                 // e.g. qklwmgj...supabase.co
        pathname: "/storage/v1/object/public/**" // public bucket objects
      },
    ],
  },
};

export default nextConfig;
