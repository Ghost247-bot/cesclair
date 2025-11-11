import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '@/db/schema';

// Lazy initialization - only connect when actually needed (at request time)
let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function initializeDb() {
  // Guard: Check if DATABASE_URL is set before attempting connection
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is not set! ' +
      'Please configure it in your environment variables.'
    );
  }

  try {
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
    });

    dbInstance = drizzle(pool, { schema });
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw new Error(
      'Failed to initialize database connection: ' + 
      (error instanceof Error ? error.message : String(error))
    );
  }
}

// Lazy getter - only initializes when db is first accessed
function getDb(): ReturnType<typeof drizzle> {
  if (!dbInstance) {
    dbInstance = initializeDb();
  }
  return dbInstance;
}

// Export db with lazy initialization
// This ensures the connection is only created at request time, not build time
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const db = getDb();
    const value = db[prop as keyof typeof db];
    // If it's a function, bind it to the db instance
    if (typeof value === 'function') {
      return value.bind(db);
    }
    return value;
  }
}) as ReturnType<typeof drizzle>;

export type Database = ReturnType<typeof drizzle>;