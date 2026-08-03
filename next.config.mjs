import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static test site — no Node server, no database. Data lives in the browser (localStorage).
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  outputFileTracingRoot: projectRoot,
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": projectRoot
    };
    return config;
  }
};

export default nextConfig;
