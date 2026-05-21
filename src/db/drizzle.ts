import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

function initDb() {
  if (typeof window !== "undefined") {
    // Running on client — should never access db directly.
    // Return a proxy that throws helpful errors if misused.
    return new Proxy({} as ReturnType<typeof drizzle>, {
      get() {
        throw new Error("Database cannot be accessed from the browser. Use API routes instead.");
      },
    });
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }

  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

let _db: ReturnType<typeof initDb> | null = null;

export const db = new Proxy({} as ReturnType<typeof initDb>, {
  get(_, prop) {
    if (!_db) _db = initDb();
    return (_db as Record<string | symbol, unknown>)[prop];
  },
});
