import type { NextConfig } from "next";

import { config } from "dotenv";
import createNextIntlPlugin from "next-intl/plugin";
import { resolve } from "node:path";

// Load environment variables from repository root
// This is needed in Turborepo monorepo where .env is at repo root, not in app folder
config({ path: resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  typedRoutes: true,
  reactCompiler: true,
  devIndicators: {
    position: "top-right",
  },

  // allow image hosting from external domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/a/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/u/**",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/lrigu76hy/**",
      },
      {
        protocol: "https",
        hostname: "html.tailus.io",
        pathname: "/blocks/**",
      },
      {
        protocol: "https",
        hostname: "greendex.world",
        pathname: "/wp-content/**",
      },
    ],
  },

  experimental: {
    // Enable filesystem caching for `next dev`
    turbopackFileSystemCacheForDev: true,
    // Enable filesystem caching for `next build`
    turbopackFileSystemCacheForBuild: true,

    // Reduce initial memory footprint
    preloadEntriesOnStart: false,
  },
};

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

export default withNextIntl(nextConfig);
