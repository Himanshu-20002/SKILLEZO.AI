import type { NextConfig } from "next";
import os from "os";

// Dynamically collect all local network IP addresses so cross-origin requests from LAN (e.g. 192.168.1.183) are not blocked
function getDevOrigins(): string[] {
  const origins = new Set<string>([
    "localhost",
    "127.0.0.1",
    "192.168.1.183",
    "192.168.4.45",
  ]);

  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        if (net.family === "IPv4" || (net.family as any) === 4) {
          origins.add(net.address);
        }
      }
    }
  } catch {
    // Fallback gracefully
  }

  return Array.from(origins);
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getDevOrigins(),
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

