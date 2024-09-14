import "./app/env.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      crypto: false,
      os: false,
    };

    return config;
  },
};

export default nextConfig;
