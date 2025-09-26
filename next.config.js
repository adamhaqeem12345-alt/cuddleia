/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    httpAgentOptions: {
      keepAlive: false,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        port: '',
        pathname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_URL: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : 'https://www.cuddleia.com',
  }
};

module.exports = nextConfig;
