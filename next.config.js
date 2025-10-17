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
    TOYYIBPAY_SECRET_KEY: process.env.TOYYIBPAY_SECRET_KEY,
    TOYYIBPAY_CATEGORY_CODE: process.env.TOYYIBPAY_CATEGORY_CODE,
    TOYYIBPAY_API_ENV: process.env.TOYYIBPAY_API_ENV,
  },
};

module.exports = nextConfig;
