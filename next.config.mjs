/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    MAILTRAP_API_TOKEN: process.env.MAILTRAP_API_TOKEN,
  },
};

export default nextConfig;
