/** @type {import('next').NextConfig} */
const nextConfig = {
  // Adding a comment to force a build environment reset. This may resolve platform-level build errors.
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
};

module.exports = nextConfig;

    