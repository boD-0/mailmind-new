/**
 * Extract the client IP address from the request.
 * Centralized utility used by auth, audit logging, and rate limiting.
 *
 * Checks common headers for proxied environments (Vercel, Cloudflare, etc.).
 * Returns "127.0.0.1" as safe fallback.
 */
export function getClientIp(request: Request): string {
  // Vercel / standard proxy
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0];
    if (firstIp) return firstIp.trim();
  }

  // Cloudflare
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  // Fallback
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "127.0.0.1";
}
