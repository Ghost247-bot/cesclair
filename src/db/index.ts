import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db/schema';

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle> | undefined;
};

function getDb(): ReturnType<typeof drizzle> {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set! Please configure it in your environment variables.');
  }
  if (!globalForDb.db) {
    const sql = neon(connectionString);
    globalForDb.db = drizzle(sql, { schema });
  }
  return globalForDb.db;
}

// Lazy-initialized so build (e.g. Vercel) can run without DATABASE_URL at import time
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});

export type Database = ReturnType<typeof drizzle>;