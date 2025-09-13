import type { NextConfig } from "next";

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

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: process.env.NODE_ENV === "production"
        ? prodOrigins
        : ["localhost:3000"]
    }
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "scontent.cdninstagram.com" },
      { protocol: "https", hostname: "platform-lookaside.fbsbx.com" }
    ]
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY
  },
  eslint: {
    // Build sırasında ESLint hatalarını yok say
    ignoreDuringBuilds: true
  }
};

export default nextConfig;