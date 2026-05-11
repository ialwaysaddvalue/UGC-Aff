/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['files.heygen.ai', 'cdn.higgsfield.ai', 'oaidalleapiprodscus.blob.core.windows.net'],
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig
