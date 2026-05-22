import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    if (typeof window !== "undefined") {
      throw new Error("Database cannot be accessed from the browser. Use API routes instead.");
    }
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set");
    }
    _db = drizzle(neon(process.env.DATABASE_URL), { schema });
  }
  return _db;
}

/**
 * Lazy-initialized database proxy.
 * Defers the neon/drizzle connection until first access (server-side only).
 * On the client, throws a helpful error on any access.
 */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
});
