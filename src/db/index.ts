import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db/schema';

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set!');
}

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle> | undefined;
};

if (!globalForDb.db) {
  const sql = neon(connectionString);
  globalForDb.db = drizzle(sql, { schema });
}

export const db = globalForDb.db;
export type Database = ReturnType<typeof drizzle>;