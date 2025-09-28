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
        NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    }
};

module.exports = nextConfig;
