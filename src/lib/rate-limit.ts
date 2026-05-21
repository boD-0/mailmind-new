import { redis } from "./redis";

/**
 * Rate limit result returned to middleware/API routes.
 */
export interface RateLimitResult {
  /** Whether the request is allowed (true) or rate-limited (false) */
  success: boolean;
  /** Maximum requests allowed in the window */
  limit: number;
  /** Remaining requests in the current window */
  remaining: number;
  /** Unix timestamp (ms) when the window resets */
  reset: number;
  /** Seconds until the window resets (for Retry-After header) */
  retryAfterSeconds: number;
}

/**
 * Options for the sliding-window rate limiter.
 */
export interface RateLimitOptions {
  /** Unique key prefix for this rate limit (e.g. "auth:login") */
  keyPrefix: string;
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Identifier for the client (IP address, user ID, etc.) */
  identifier: string;
}

/**
 * Sliding-window rate limiter backed by Upstash Redis.
 *
 * Uses Redis sorted sets for precise sliding window implementation.
 * Each request is added as a member with its timestamp as the score.
 * Old entries outside the window are trimmed before counting.
 */
export async function rateLimit(
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const { keyPrefix, maxRequests, windowSeconds, identifier } = options;

  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const key = `ratelimit:${keyPrefix}:${identifier}`;
  const member = `${now}-${Math.random().toString(36).slice(2, 10)}`;

  try {
    // Use Redis MULTI for atomicity
    const pipeline = redis.pipeline();

    // Remove entries outside the current window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Count current entries
    pipeline.zcard(key);

    // Add the current request
    pipeline.zadd(key, { score: now, member });

    // Set expiry on the key (slightly longer than the window)
    pipeline.expire(key, windowSeconds + 10);

    const results = await pipeline.exec();

    if (!results) {
      // Redis error — allow the request (fail-open)
      console.error(`[RateLimit] Redis pipeline returned null for key: ${key}`);
      return { success: true, limit: maxRequests, remaining: maxRequests, reset: now + windowSeconds * 1000, retryAfterSeconds: 0 };
    }

    // results[1] is the ZCARD result (count before adding current request)
    const countBefore = (results[1] as number) ?? 0;

    const remaining = Math.max(0, maxRequests - countBefore - 1);
    const success = countBefore < maxRequests;

    // Get the oldest entry in the window to calculate reset time
    const oldest = await redis.zrange(key, 0, 0, { withScores: true });
    const resetTime = (oldest && oldest.length > 0)
      ? (oldest[1] as number) + windowSeconds * 1000
      : now + windowSeconds * 1000;

    const retryAfterSeconds = Math.ceil((resetTime - now) / 1000);

    return {
      success,
      limit: maxRequests,
      remaining,
      reset: resetTime,
      retryAfterSeconds: Math.max(0, retryAfterSeconds),
    };
  } catch (error) {
    console.error(`[RateLimit] Error for key=${key}:`, error);
    // Fail-open: allow the request if Redis is down
    return { success: true, limit: maxRequests, remaining: maxRequests, reset: now + windowSeconds * 1000, retryAfterSeconds: 0 };
  }
}

/**
 * Pre-configured rate limiters for common use cases.
 */

/** Rate limit for login attempts: 5 per minute per IP */
export async function loginRateLimit(ip: string): Promise<RateLimitResult> {
  return rateLimit({
    keyPrefix: "auth:login",
    maxRequests: 5,
    windowSeconds: 60,
    identifier: ip,
  });
}

/** Rate limit for signup: 3 per minute per IP */
export async function signupRateLimit(ip: string): Promise<RateLimitResult> {
  return rateLimit({
    keyPrefix: "auth:signup",
    maxRequests: 3,
    windowSeconds: 60,
    identifier: ip,
  });
}

/** Rate limit for password reset: 3 per 10 minutes per IP */
export async function passwordResetRateLimit(ip: string): Promise<RateLimitResult> {
  return rateLimit({
    keyPrefix: "auth:password-reset",
    maxRequests: 3,
    windowSeconds: 600,
    identifier: ip,
  });
}

/** Rate limit for general API calls: 100 per minute per user */
export async function apiRateLimit(userId: string): Promise<RateLimitResult> {
  return rateLimit({
    keyPrefix: "api:general",
    maxRequests: 100,
    windowSeconds: 60,
    identifier: userId,
  });
}

/** Rate limit for AI generation endpoints: 10 per minute per user */
export async function aiGenerationRateLimit(userId: string): Promise<RateLimitResult> {
  return rateLimit({
    keyPrefix: "api:ai",
    maxRequests: 10,
    windowSeconds: 60,
    identifier: userId,
  });
}

/** Rate limit for file uploads: 5 per minute per user */
export async function uploadRateLimit(userId: string): Promise<RateLimitResult> {
  return rateLimit({
    keyPrefix: "api:upload",
    maxRequests: 5,
    windowSeconds: 60,
    identifier: userId,
  });
}
