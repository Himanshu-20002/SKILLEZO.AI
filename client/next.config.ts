import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "192.168.4.45", "127.0.0.1"],
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "https://skillezoai-production.up.railway.app";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

