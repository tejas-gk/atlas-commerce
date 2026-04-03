/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  experimental: {
    turbo: {
      resolveAlias: {
        "@workspace/ui": "../../../packages/ui/src",
      },
    },
  },
}

export default nextConfig