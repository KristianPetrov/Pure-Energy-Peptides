import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy initialization so build-time imports do not require a live database.
let cached: NeonHttpDatabase<typeof schema> | null = null;

export function getDb() {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    cached = drizzle(neon(url), { schema });
  }
  return cached;
}

export { schema };
