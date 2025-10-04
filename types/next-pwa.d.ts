declare module "next-pwa" {
  import { NextConfig } from "next";
  const withPWA: (config: NextConfig & any) => any;
  export { withPWA };
}

declare module "next-pwa/cache" {
  const runtimeCaching: any;
  export default runtimeCaching;
}
