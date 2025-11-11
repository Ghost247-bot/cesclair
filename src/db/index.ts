import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '@/db/schema';

// Lazy initialization - only connect when actually needed (at request time)
let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;
let isInitializing = false;
let initError: Error | null = null;

function initializeDb() {
  // Guard: Check if DATABASE_URL is set before attempting connection
  if (!process.env.DATABASE_URL) {
    const error = new Error(
      'DATABASE_URL environment variable is not set! ' +
      'Please configure it in your environment variables.'
    );
    initError = error;
    throw error;
  }

  // Clean up the connection string - remove channel_binding if present as it can cause issues
  let connectionString = process.env.DATABASE_URL;
  
  // Remove channel_binding parameter as it's not supported in all environments
  try {
    const url = new URL(connectionString);
    url.searchParams.delete('channel_binding');
    connectionString = url.toString();
  } catch {
    // If URL parsing fails, use the original string
    connectionString = process.env.DATABASE_URL;
  }

  try {
    // Create pool with proper configuration for Neon serverless
    // For Netlify serverless functions, max: 1 is optimal
    pool = new Pool({ 
      connectionString: connectionString,
      max: 1, // Neon serverless works best with max 1 connection for serverless environments
      // Allow connection to be established asynchronously
      connectionTimeoutMillis: 10000, // 10 second timeout for initial connection
    });

    dbInstance = drizzle(pool, { schema });
    initError = null; // Clear any previous errors
    return dbInstance;
  } catch (error) {
    const dbError = error instanceof Error 
      ? error 
      : new Error(String(error));
    
    console.error('Failed to initialize database:', {
      message: dbError.message,
      stack: dbError.stack,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
    });
    
    initError = dbError;
    throw new Error(
      'Failed to initialize database connection: ' + dbError.message
    );
  }
}

// Lazy getter - only initializes when db is first accessed
function getDb(): ReturnType<typeof drizzle> {
  // If we have a previous error and pool is null, try to reinitialize
  if (!dbInstance && initError) {
    console.log('Retrying database initialization after previous error');
    pool = null;
    initError = null;
    isInitializing = false;
  }

  if (!dbInstance && !isInitializing) {
    isInitializing = true;
    try {
      dbInstance = initializeDb();
    } finally {
      isInitializing = false;
    }
  }
  
  if (!dbInstance) {
    throw new Error(
      'Database instance is not available. ' +
      (initError ? initError.message : 'Initialization may be in progress.')
    );
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