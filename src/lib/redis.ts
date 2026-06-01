import { Redis } from "@upstash/redis";

/**
 * Creates a Redis client or a graceful no-op mock when credentials are missing.
 * This prevents the entire app from failing when Upstash env vars aren't set.
 */
function createRedisClient(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Return a mock that logs a warning once and always succeeds (fail-open)
    let warned = false;
    // Return null (not undefined) to match real Redis behavior for missing keys
    const noop = async () => null as null;
    return {
      pipeline: () => ({
        zremrangebyscore: noop,
        zcard: noop,
        zadd: noop,
        expire: noop,
        exec: async () => {
          if (!warned) {
            console.warn("[Redis] Upstash credentials missing — rate limiting disabled. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable.");
            warned = true;
          }
          return null;
        },
      }),
      zrange: async () => [],
      get: noop,
      set: noop,
      del: noop,
      exists: async () => 0,
      incr: async () => 1,
      expire: noop,
      sadd: noop,
      srem: noop,
      smembers: async () => [],
      hget: noop,
      hset: noop,
      hdel: noop,
      hgetall: async () => null,
      keys: async () => [],
      flushall: noop,
    } as unknown as Redis;
  }

  return new Redis({ url, token });
}

export const redis = createRedisClient();

export const CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds
