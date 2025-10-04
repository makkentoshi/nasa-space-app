import type { NextConfig } from "next";
import { withPWA } from "next-pwa";
import runtimeCaching from "next-pwa/cache";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // keep existing options here
  // appDir is an experimental option; cast to any to avoid strict type mismatch
  experimental: {
    // TypeScript Next types may lag behind runtime options in newer Next versions
    // so we cast this block to `any` when merging.
    appDir: true,
  } as any,
};

export default withPWA({
  ...nextConfig,
  pwa: {
    dest: "public",
    register: false,
    skipWaiting: true,
    disable: !isProd,
    runtimeCaching,
  },
});
