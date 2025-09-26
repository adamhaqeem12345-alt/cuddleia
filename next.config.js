
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
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: 'AcP9f98y69e5wW3gR4v1qoIoZejFUNxj4CF9ceA-CBbXq152xI1qnMugLF_rKs3yXN-fuyFIKuWpqeIW',
    PAYPAL_CLIENT_SECRET: 'EPzLlEHKxGkpQi-4xKYuVkw-fmbDTr9Wmu0U-5SO9Px6-La1Kx9iN2cdg3iJJi9usDuF5Vlo_6PCKhx9',
    PAYPAL_EMAIL: 'adamhaqeem12345@gmail.com',
    PAYPAL_WEBHOOK_ID: '67N55929UU247644U',
    GMAIL_USER: 'hello@cuddleia.com',
    GMAIL_APP_PASSWORD: 'cNJ7PVVQBcCB',
    // Switch between 'https://api-m.sandbox.paypal.com' and 'https://api-m.paypal.com'
    PAYPAL_API_URL: 'https://api-m.sandbox.paypal.com' 
  }
};

module.exports = nextConfig;
