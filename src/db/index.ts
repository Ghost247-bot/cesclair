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

  // Clean up the connection string - remove problematic parameters
  let connectionString = process.env.DATABASE_URL;
  
  // Remove channel_binding and other problematic parameters
  // These can cause connection failures in serverless environments
  try {
    const url = new URL(connectionString);
    
    // Remove problematic parameters
    url.searchParams.delete('channel_binding');
    url.searchParams.delete('channel_binding=require');
    
    // Ensure sslmode is set correctly (required for Neon)
    if (!url.searchParams.has('sslmode')) {
      url.searchParams.set('sslmode', 'require');
    }
    
    connectionString = url.toString();
    // Only log connection details in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Cleaned connection string (preview):', {
        host: url.hostname,
        database: url.pathname,
        hasSslMode: url.searchParams.has('sslmode'),
        sslMode: url.searchParams.get('sslmode'),
        hasChannelBinding: url.searchParams.has('channel_binding'),
      });
    }
  } catch (urlError) {
    // If URL parsing fails, try string replacement as fallback
    console.warn('URL parsing failed, using string replacement:', urlError);
    connectionString = connectionString
      .replace(/[?&]channel_binding=require/gi, '')
      .replace(/[?&]channel_binding/gi, '');
    
    // Ensure sslmode is present
    if (!connectionString.includes('sslmode=')) {
      connectionString += (connectionString.includes('?') ? '&' : '?') + 'sslmode=require';
    }
  }

  try {
    // Create pool with proper configuration for Neon serverless
    // For Netlify serverless functions, max: 1 is optimal
    // Note: Pool creation doesn't establish a connection immediately
    // Connections are established lazily when queries are executed
    pool = new Pool({ 
      connectionString: connectionString,
      max: 1, // Neon serverless works best with max 1 connection for serverless environments
      // Allow idle connections to be closed after 30 seconds
      // This helps with serverless cold starts
      idleTimeoutMillis: 30000,
      // Connection timeout for initial connection
      connectionTimeoutMillis: 10000,
    });

    dbInstance = drizzle(pool, { schema });
    initError = null; // Clear any previous errors
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Database pool initialized successfully');
    }
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