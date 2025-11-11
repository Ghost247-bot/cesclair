import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '@/db/schema';

// Initialize database connection
// For serverless, we initialize immediately but connections are lazy
function getConnectionString(): string {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is not set! ' +
      'Please configure it in your environment variables.'
    );
  }

  let connectionString = process.env.DATABASE_URL;
  
  // Clean up the connection string - remove problematic parameters
  try {
    const url = new URL(connectionString);
    
    // Remove problematic parameters that cause issues in serverless
    url.searchParams.delete('channel_binding');
    
    // Ensure sslmode is set correctly (required for Neon)
    if (!url.searchParams.has('sslmode')) {
      url.searchParams.set('sslmode', 'require');
    }
    
    connectionString = url.toString();
  } catch (urlError) {
    // If URL parsing fails, use string replacement as fallback
    connectionString = connectionString
      .replace(/[?&]channel_binding=require/gi, '')
      .replace(/[?&]channel_binding/gi, '');
    
    // Ensure sslmode is present
    if (!connectionString.includes('sslmode=')) {
      connectionString += (connectionString.includes('?') ? '&' : '?') + 'sslmode=require';
    }
  }

  return connectionString;
}

// Create pool with proper configuration for Neon serverless
// Pool creation is safe at module level - it doesn't connect until first query
let pool: Pool;
let dbInstance: ReturnType<typeof drizzle>;

try {
  pool = new Pool({ 
    connectionString: getConnectionString(),
    max: 1, // Neon serverless works best with max 1 connection
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 10000, // 10 second timeout for initial connection
  });

  // Create drizzle instance with schema
  // This is safe to do at module level - Pool doesn't connect until first query
  dbInstance = drizzle(pool, { schema });
} catch (error) {
  console.error('Failed to initialize database pool:', error);
  // Re-throw to fail fast if DATABASE_URL is missing
  throw error;
}

export const db = dbInstance;

export type Database = ReturnType<typeof drizzle>;