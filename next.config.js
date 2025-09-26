
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    PAYPAL_EMAIL: process.env.PAYPAL_EMAIL,
    PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
    // Switch between 'https://api-m.sandbox.paypal.com' and 'https://api-m.paypal.com'
    PAYPAL_API_URL: process.env.PAYPAL_API_URL 
  }
};

module.exports = nextConfig;
