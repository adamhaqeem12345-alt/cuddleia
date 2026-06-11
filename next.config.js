// Load environment variables from .env file
require('dotenv').config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Triggering a re-bundle to fix corrupted cache
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
