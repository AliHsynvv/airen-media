import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";
import bundleAnalyzer from "@next/bundle-analyzer";

const envOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const vercelUrl =
  process.env.VERCEL_URL
    ? process.env.VERCEL_URL.replace(/^https?:\/\//, "")
    : undefined;

const prodOrigins = [
  ...envOrigins,
  ...(vercelUrl ? [vercelUrl] : []),
  "yourdomain.com",
  "www.yourdomain.com",
  "admin.yourdomain.com",
  "yourproject.vercel.app"
];

// Derive Supabase storage host for Next Image allowlist
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let SUPABASE_HOST = "";
try {
  SUPABASE_HOST = SUPABASE_URL ? new URL(SUPABASE_URL).host : "";
} catch {}

const remotePatterns: RemotePattern[] = [
  { protocol: "https", hostname: "images.unsplash.com" },
  { protocol: "https", hostname: "unsplash.com" },
  { protocol: "https", hostname: "res.cloudinary.com" },
  { protocol: "https", hostname: "scontent.cdninstagram.com" },
  { protocol: "https", hostname: "platform-lookaside.fbsbx.com" },
  // Generic Supabase domain wildcard
  { protocol: "https", hostname: "**.supabase.co" },
  // Precise storage remote pattern from env host
  ...(SUPABASE_HOST ? [{ protocol: "https", hostname: SUPABASE_HOST, pathname: "/storage/v1/object/public/**" } as RemotePattern] : []),
]

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: process.env.NODE_ENV === "production"
        ? prodOrigins
        : ["localhost:3000"]
    }
  },
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/icons/{{member}}"
    },
    "date-fns": {
      transform: "date-fns/{{member}}"
    }
  },
  images: {
    // Merge existing remote patterns with Supabase storage patterns
    remotePatterns,
    // Also include domains list for compatibility
    domains: [
      ...(SUPABASE_HOST ? [SUPABASE_HOST] : []),
      "supabase.co"
    ]
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY
  },
  eslint: {
    // Build sırasında ESLint hatalarını yok say
    ignoreDuringBuilds: true
  },
  webpack: (config) => {
    // Prevent client bundle from trying to include Node-only modules
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      canvas: false,
      fs: false,
      path: false,
    };
    // Keep alias minimal; deep subpath exports may be blocked by package exports
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
    };
    return config;
  }
};

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

export default withBundleAnalyzer(nextConfig);