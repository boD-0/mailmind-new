import { safeJsonParse } from "../utils";

/**
 * Logica pentru sincronizarea prospectelor cu Klaviyo.
 */
export async function syncToKlaviyo(prospectData: Record<string, unknown>) {
  const response = await fetch('/api/klaviyo/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prospectData)
  });
  
  const text = await response.text();
  return safeJsonParse(text, { success: false });
}
