  import type { NextConfig } from "next";

  const nextConfig: NextConfig = {
    allowedDevOrigins: ['192.168.10.198'],
    async rewrites() {
      return [
        {
          source: '/investor-update/:path*',
          destination:
  'https://lemnisca-investor-update.vercel.app/:path*',
        },
      ];
    },
  };

  export default nextConfig;
