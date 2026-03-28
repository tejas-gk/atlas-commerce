/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  // Nx wrappers removed. ImageKit and standalone output preserved.
  images: {
    remotePatterns: [
      {
        hostname: "ik.imagekit.io",
      },
    ],
  },
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  experimental: {
    esmExternals: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@packages": path.resolve(__dirname, "../../packages"),
    };
    return config;
  },
};

module.exports = nextConfig;