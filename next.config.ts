import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  devIndicators: {
    position: "bottom-right",
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
        hostname: "ik.imagekit.io",
        pathname: "/lrigu76hy/**",
      },
      {
        protocol: "https",
        hostname: "tailus.io",
        pathname: "/blocks/**",
      },
      {
        protocol: "https",
        hostname: "greendex.world",
        pathname: "/wp-content/**",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

export default withNextIntl(nextConfig);
