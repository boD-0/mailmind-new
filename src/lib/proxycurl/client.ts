/**
 * Proxycurl API client — LinkedIn prospect enrichment.
 *
 * Docs: https://nubela.co/proxycurl/docs
 * Uses the Person Profile Endpoint to enrich a LinkedIn profile URL
 * into structured prospect data (name, title, company, summary, etc.).
 */

const PROXYCURL_BASE = "https://nubela.co/proxycurl/v2";

export interface LinkedinProfile {
  public_identifier: string | null;
  profile_pic_url: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  occupation: string | null;
  headline: string | null;
  summary: string | null;
  country_full_name: string | null;
  city: string | null;
  experiences: Array<{
    company: string | null;
    title: string | null;
    description: string | null;
    starts_at: { day: number | null; month: number | null; year: number | null } | null;
    ends_at: { day: number | null; month: number | null; year: number | null } | null;
  }>;
  education: Array<{
    school: string | null;
    degree_name: string | null;
    field_of_study: string | null;
  }>;
  skills: string[];
  languages: string[];
  industry: string | null;
}

export interface EnrichedProspect {
  name: string;
  company: string | null;
  title: string | null;
  summary: string | null;
  industry: string | null;
  profileUrl: string;
  skills: string[];
}

interface ProxycurlError {
  error: string;
  code?: number;
}

/**
 * Fetch a LinkedIn profile by URL.
 * Falls back gracefully if the Proxycurl API key is missing.
 */
export async function fetchLinkedinProfile(linkedinUrl: string): Promise<EnrichedProspect | null> {
  const apiKey = process.env.PROXYCURL_API_KEY;
  if (!apiKey) {
    console.warn("[Proxycurl] PROXYCURL_API_KEY not configured — skipping LinkedIn enrichment");
    return null;
  }

  const url = `${PROXYCURL_BASE}/linkedin?url=${encodeURIComponent(linkedinUrl)}&fallback_to_cache=on-error&use_cache=if-present&skills=include`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as ProxycurlError;
      console.error(`[Proxycurl] API error ${res.status}: ${err.error || "unknown"}`);
      return null;
    }

    const profile = (await res.json()) as LinkedinProfile;

    // Extract company from current experience
    const currentExp = profile.experiences?.[0];
    const company = currentExp?.company || null;
    const title = currentExp?.title || profile.headline || profile.occupation || null;

    return {
      name: profile.full_name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Unknown",
      company,
      title,
      summary: profile.summary || null,
      industry: profile.industry || null,
      profileUrl: linkedinUrl,
      skills: profile.skills || [],
    };
  } catch (err) {
    console.error("[Proxycurl] Fetch error:", err);
    return null;
  }
}

/**
 * Search for a person on LinkedIn by name + company.
 * Returns the best-matching profile URL.
 */
export async function searchLinkedinProfile(
  name: string,
  company?: string
): Promise<string | null> {
  const apiKey = process.env.PROXYCURL_API_KEY;
  if (!apiKey) return null;

  const query = company ? `${name} ${company}` : name;
  const url = `${PROXYCURL_BASE}/search/person?country=US&enrich_profiles=enrich&page_size=3&q=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { results?: Array<{ linkedin_profile_url?: string }> };
    return data.results?.[0]?.linkedin_profile_url || null;
  } catch {
    return null;
  }
}
