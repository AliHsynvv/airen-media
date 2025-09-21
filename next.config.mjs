/** @type {import('next').NextConfig} */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
let SUPABASE_HOST = ''
try { SUPABASE_HOST = new URL(SUPABASE_URL).host } catch {}

const nextConfig = {
  eslint: {
    // Skip eslint errors during production builds (Vercel)
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      // Supabase storage host (from env)
      ...(SUPABASE_HOST ? [SUPABASE_HOST] : []),
      // Optional fallbacks (common Supabase regions)
      'supabase.co',
    ],
    remotePatterns: [
      ...(SUPABASE_HOST ? [{ protocol: 'https', hostname: SUPABASE_HOST, pathname: '/storage/v1/object/public/**' }] : []),
    ],
  },
  webpack: (config) => {
    // Prevent client bundle from trying to include Node-only modules
    config.resolve = config.resolve || {}
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      canvas: false,
      fs: false,
      path: false,
    }
    return config
  },
}

export default nextConfig


