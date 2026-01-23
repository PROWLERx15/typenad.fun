import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use empty turbopack config
  turbopack: {},

  // Configure headers for cross-origin
  // Note: Only COOP is set. COEP is removed to allow Privy iframe to load.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
