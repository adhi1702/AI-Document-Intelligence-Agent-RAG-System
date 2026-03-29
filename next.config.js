/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "onnxruntime-node"],
  },
};

module.exports = nextConfig;
