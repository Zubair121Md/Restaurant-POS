import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: projectRoot,
  reactStrictMode: true,
  // Explicit alias so production installs on Linux/Render always resolve @/*
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": projectRoot
    };
    return config;
  },
  // Avoid issues if a host injects a non-default dist dir
  distDir: ".next"
};

export default nextConfig;
