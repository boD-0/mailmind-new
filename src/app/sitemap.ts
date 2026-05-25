import type { MetadataRoute } from "next"

/**
 * Dynamic sitemap.xml generation.
 * Indexes all public-facing pages with appropriate priorities
 * and change frequencies.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mailmind.app"

  // Public pages indexed for SEO
  const locales = ["en", "ro", "fr", "de"]

  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    // Landing page
    entries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    })

    // Demo page
    entries.push({
      url: `${baseUrl}/${locale}/demo`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    })

    // Pricing page
    entries.push({
      url: `${baseUrl}/${locale}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    })
  }

  return entries
}
