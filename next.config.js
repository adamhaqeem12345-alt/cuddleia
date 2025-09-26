
/** @type {import('next').NextConfig} */
const nextConfig = {
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
    NEXT_PUBLIC_PAYPAL_EMAIL: 'adamhaqeem12345@gmail.com',
    GMAIL_USER: 'hello@cuddleia.com',
    GMAIL_APP_PASSWORD: 'ZNFE8nNe0WM4',
  }
};

module.exports = nextConfig;
