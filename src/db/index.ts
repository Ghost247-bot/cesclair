import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '@/db/schema';

// Note: WebSocket configuration is not needed for Neon pooler connections
// The pooler endpoint uses HTTP, so WebSocket configuration is not required
// If you need direct connections (not pooler), you would configure WebSocket here

// Initialize database connection
// For serverless, we initialize immediately but connections are lazy
function getConnectionString(): string {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is not set! ' +
      'Please configure it in your environment variables.'
    );
  }

  let connectionString = process.env.DATABASE_URL.trim();
  
  // Clean up the connection string - remove problematic parameters
  try {
    const url = new URL(connectionString);
    
    // Remove problematic parameters that cause issues in serverless
    // Remove all variations of channel_binding
    url.searchParams.delete('channel_binding');
    url.searchParams.delete('Channel_Binding');
    url.searchParams.delete('CHANNEL_BINDING');
    
    // Remove any other problematic parameters
    url.searchParams.delete('connect_timeout');
    
    // Ensure sslmode is set correctly (required for Neon)
    // Use 'prefer' instead of 'require' for better compatibility
    if (!url.searchParams.has('sslmode')) {
      url.searchParams.set('sslmode', 'require');
    } else if (url.searchParams.get('sslmode') === 'disable') {
      url.searchParams.set('sslmode', 'require');
    }
    
    // Ensure we're using the pooler endpoint correctly
    // If it's a direct connection, we might want to use pooler
    const hostname = url.hostname;
    if (hostname && !hostname.includes('pooler') && !hostname.includes('neon.tech')) {
      console.warn('Database connection might not be using Neon pooler endpoint');
    }
    
    connectionString = url.toString();
  } catch (urlError) {
    // If URL parsing fails, use comprehensive string replacement as fallback
    connectionString = connectionString
      // Remove channel_binding with various formats
      .replace(/[?&]channel_binding=require/gi, '')
      .replace(/[?&]channel_binding=prefer/gi, '')
      .replace(/[?&]channel_binding=disable/gi, '')
      .replace(/[?&]channel_binding=[^&]*/gi, '')
      .replace(/[?&]channel_binding/gi, '')
      // Clean up double ampersands and question marks
      .replace(/[&]{2,}/g, '&')
      .replace(/\?&/g, '?')
      .replace(/[?&]$/g, '');
    
    // Ensure sslmode is present
    if (!connectionString.includes('sslmode=')) {
      connectionString += (connectionString.includes('?') ? '&' : '?') + 'sslmode=require';
    } else if (connectionString.match(/sslmode=(disable|off)/i)) {
      connectionString = connectionString.replace(/sslmode=(disable|off)/i, 'sslmode=require');
    }
  }

  // Final verification: ensure channel_binding is completely removed
  if (connectionString.toLowerCase().includes('channel_binding')) {
    console.error('WARNING: channel_binding parameter still present in connection string after cleaning!');
    // Force remove it one more time
    connectionString = connectionString
      .replace(/[?&]channel_binding=[^&]*/gi, '')
      .replace(/[?&]channel_binding/gi, '')
      .replace(/[&]{2,}/g, '&')
      .replace(/\?&/g, '?')
      .replace(/[?&]$/g, '');
  }
  
  // Verify connection string is valid
  if (!connectionString || connectionString.trim().length === 0) {
    throw new Error('Connection string is empty after cleaning!');
  }
  
  return connectionString;
}

// Create pool with proper configuration for Neon serverless
// Pool creation is safe at module level - it doesn't connect until first query
let pool: Pool;
let dbInstance: ReturnType<typeof drizzle>;

try {
  const connectionString = getConnectionString();
  
  // Log connection string only once on first initialization (not on every module reload)
  if (!(globalThis as any).__dbInitialized) {
    const safeUrl = connectionString.replace(/:([^:@]+)@/, ':****@');
    console.log('Database connection string (cleaned):', safeUrl);
    (globalThis as any).__dbInitialized = true;
  }
  
  // Verify no problematic parameters are present
  if (connectionString.toLowerCase().includes('channel_binding')) {
    console.error('ERROR: channel_binding parameter detected in connection string!');
    console.error('This will cause connection issues with Neon serverless.');
    throw new Error('Connection string contains channel_binding parameter which is not supported by Neon serverless');
  }
  
  pool = new Pool({ 
    connectionString: connectionString,
    max: 1, // Neon serverless works best with max 1 connection per instance
    idleTimeoutMillis: 60000, // Close idle connections after 60 seconds (increased)
    connectionTimeoutMillis: 30000, // 30 second timeout for initial connection (increased)
    // Don't allow pool to exit on idle - keep connection alive
    allowExitOnIdle: false,
    // Additional configuration for better stability
    maxUses: 7500, // Maximum number of times a connection can be used before it's replaced
  });

  // Add event handlers for better debugging (only log errors, not every connection)
  pool.on('error', (err) => {
    console.error('Database pool error:', {
      message: err.message,
      code: (err as any).code,
      stack: err.stack,
    });
  });

  // Only log connection events if explicitly enabled via env var
  if (process.env.DATABASE_DEBUG === 'true') {
    pool.on('connect', () => {
      console.log('Database connection established');
    });

    pool.on('remove', () => {
      console.log('Database connection removed from pool');
    });
  }

  // Create drizzle instance with schema
  // This is safe to do at module level - Pool doesn't connect until first query
  dbInstance = drizzle(pool, { 
    schema,
    logger: process.env.NODE_ENV === 'development',
  });
} catch (error) {
  console.error('Failed to initialize database pool:', error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('Error details:', {
    message: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
  });
  // Re-throw to fail fast if DATABASE_URL is missing
  throw error;
}

export const db = dbInstance;

export type Database = ReturnType<typeof drizzle>;