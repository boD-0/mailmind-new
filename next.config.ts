import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS?.split(',').map(s => s.trim()) ?? [],
  serverExternalPackages: [
    "@better-auth/sso",
    "samlify",
    "@authenio/xml-encryption",
    "@better-auth/kysely-adapter",
  ],
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
      // Locale-prefixed Sentry monitoring tunnel
      {
        source: "/:locale(en|ro|fr|de)/monitoring/:path*",
        destination: "/monitoring/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "mailmind-3d",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // tunnelRoute: "/monitoring" — disabled because we use an explicit route
  // handler at src/app/monitoring/route.ts instead (Turbopack doesn't create
  // the virtual route that withSentryConfig would generate).

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
