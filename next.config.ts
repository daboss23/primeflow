import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@anthropic-ai/sdk'],
  images: {
    unoptimized: false,
  },
}

export default nextConfig
