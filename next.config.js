/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_PAYPAL_API_ENV: process.env.PAYPAL_API_ENV,
    NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID,
    NEXT_PUBLIC_PAYPAL_LIVE_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_LIVE_CLIENT_ID,
  }
};

module.exports = nextConfig;
