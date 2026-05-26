import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS?.split(',').map(s => s.trim()) ?? [],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xubohuah.github.io',
      },
    ],
  },
  async rewrites() {
    return [
      // PostHog Rewrites - Support both root and locale-prefixed paths
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      // Locale-prefixed PostHog rewrites
      {
        source: "/:locale(en|ro|fr|de)/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/:locale(en|ro|fr|de)/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/:locale(en|ro|fr|de)/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite (ad-blocker safe)
  tunnelRoute: "/monitoring",

  // Webpack-level Sentry options (replaces deprecated top-level options)
  webpack: {
    reactComponentAnnotation: {
      enabled: true,
    },
    treeshake: {
      removeDebugLogging: true,
    },
  },

  // Telemetry helps Sentry prioritize fixes — disable if you prefer
  telemetry: false,
});
