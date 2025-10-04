import type { NextConfig } from "next";
// @ts-ignore - next-pwa doesn't have proper types
import withPWAInit from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

// @ts-ignore
const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: !isProd,
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
