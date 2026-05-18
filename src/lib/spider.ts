import { safeJsonParse } from "./utils";

export async function scrapeUrl(url: string) {
  const apiKey = process.env.SPIDER_API_KEY;
  if (!apiKey) {
    console.warn("SPIDER_API_KEY is not set. Skipping scraping.");
    return null;
  }

  try {
    const response = await fetch("https://api.spider.cloud/crawl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        limit: 1,
        return_format: "markdown",
      }),
    });

    if (!response.ok) {
      throw new Error(`Spider.cloud error: ${response.statusText}`);
    }

    const text = await response.text();
    return safeJsonParse(text, null);
  } catch (error) {
    console.error("Scraping error:", error);
    return null;
  }
}
