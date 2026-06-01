import type { MetadataRoute } from "next"

/**
 * Dynamic robots.txt generation.
 * Allows indexing of public pages (landing, pricing, demo),
 * blocks authenticated/admin routes from crawlers.
 *
 * Locale-prefixed routes (e.g. /en/dashboard, /ro/login) are
 * explicitly disallowed since all authenticated pages are
 * locale-prefixed.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mailmind.app"
  const locales = ["en", "ro", "fr", "de"]

  // Public pages indexed for SEO (allow root + locale-prefixed variants)
  const allowPaths = [
    "/",
    ...locales.flatMap((l) => [`/${l}`, `/${l}/demo`, `/${l}/pricing`]),
  ]

  // Authenticated/admin routes blocked per locale
  const disallowPaths = [
    "/admin/",
    "/api/",
    ...locales.flatMap((l) => [
      `/${l}/dashboard`,
      `/${l}/onboarding`,
      `/${l}/login`,
      `/${l}/sign-up`,
      `/${l}/maintenance`,
      `/${l}/settings`,
    ]),
  ]

  return {
    rules: [
      {
        userAgent: "*",
        allow: allowPaths,
        disallow: disallowPaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
