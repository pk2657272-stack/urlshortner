/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

module.exports = nextConfig;