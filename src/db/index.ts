import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '@/db/schema';

// Initialize database connection with error handling
let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set!');
    throw new Error('DATABASE_URL is required');
  }

  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
  });

  db = drizzle(pool, { schema });
} catch (error) {
  console.error('Failed to initialize database:', error);
  // Re-throw to prevent silent failures
  throw error;
}

export { db };
export type Database = typeof db;