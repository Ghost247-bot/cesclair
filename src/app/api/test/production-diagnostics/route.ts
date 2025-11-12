import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, session, account, verification } from '@/db/schema';
import { auth } from '@/lib/auth';
import { sql } from 'drizzle-orm';

/**
 * Production Diagnostics Endpoint
 * 
 * Checks:
 * 1. Environment variables (NEXT_PUBLIC_SITE_URL, DATABASE_URL, BETTER_AUTH_SECRET)
 * 2. Database connection and required tables
 * 3. Auth configuration (baseURL, trusted origins)
 * 
 * Access: GET /api/test/production-diagnostics
 */
export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    checks: {
      environmentVariables: {},
      database: {},
      auth: {},
    },
    errors: [],
    warnings: [],
    recommendations: [],
  };

  // 1. Check Environment Variables
  const envVars = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? '***SET***' : undefined,
    DATABASE_URL: process.env.DATABASE_URL ? '***SET***' : undefined,
    VERCEL_URL: process.env.VERCEL_URL,
  };

  diagnostics.checks.environmentVariables = {
    ...envVars,
    status: 'checking',
  };

  // Check NEXT_PUBLIC_SITE_URL
  if (!process.env.NEXT_PUBLIC_SITE_URL && !process.env.BETTER_AUTH_URL) {
    diagnostics.errors.push({
      type: 'MISSING_BASE_URL',
      message: 'NEXT_PUBLIC_SITE_URL or BETTER_AUTH_URL is not set',
      impact: 'Authentication will fail - cookies and sessions won\'t work correctly',
      fix: 'Set NEXT_PUBLIC_SITE_URL=https://cesclair.store in your production environment variables',
    });
    diagnostics.checks.environmentVariables.status = 'error';
  } else {
    const baseURL = process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || '';
    if (!baseURL.includes('cesclair.store') && !baseURL.includes('localhost')) {
      diagnostics.warnings.push({
        type: 'INCORRECT_BASE_URL',
        message: `Base URL is set to: ${baseURL}`,
        expected: 'https://cesclair.store',
        fix: 'Update NEXT_PUBLIC_SITE_URL to https://cesclair.store',
      });
    }
    diagnostics.checks.environmentVariables.status = 'ok';
  }

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    diagnostics.errors.push({
      type: 'MISSING_DATABASE_URL',
      message: 'DATABASE_URL is not set',
      impact: 'Database operations will fail',
      fix: 'Set DATABASE_URL in your production environment variables',
    });
    diagnostics.checks.environmentVariables.status = 'error';
  } else {
    // Check if it's a valid PostgreSQL URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl.includes('postgres://') && !dbUrl.includes('postgresql://')) {
      diagnostics.warnings.push({
        type: 'INVALID_DATABASE_URL',
        message: 'DATABASE_URL does not appear to be a PostgreSQL connection string',
      });
    }
  }

  // Check BETTER_AUTH_SECRET
  if (!process.env.BETTER_AUTH_SECRET) {
    diagnostics.warnings.push({
      type: 'MISSING_AUTH_SECRET',
      message: 'BETTER_AUTH_SECRET is not set, using fallback',
      impact: 'Security risk - sessions may not be secure',
      fix: 'Generate a secure secret: openssl rand -base64 32',
    });
  }

  // 2. Check Database Connection and Tables
  diagnostics.checks.database = {
    status: 'checking',
    connection: false,
    tables: {},
  };

  try {
    // Test database connection
    await db.execute(sql`SELECT 1`);
    diagnostics.checks.database.connection = true;
    diagnostics.checks.database.status = 'ok';

    // Check for required auth tables
    const requiredTables = ['user', 'session', 'account', 'verification'];
    const tableChecks: any = {};

    for (const tableName of requiredTables) {
      try {
        // Try to query the table
        let result;
        switch (tableName) {
          case 'user':
            result = await db.select().from(user).limit(1);
            break;
          case 'session':
            result = await db.select().from(session).limit(1);
            break;
          case 'account':
            result = await db.select().from(account).limit(1);
            break;
          case 'verification':
            result = await db.select().from(verification).limit(1);
            break;
        }
        tableChecks[tableName] = {
          exists: true,
          accessible: true,
        };
      } catch (tableError: any) {
        const errorMessage = tableError?.message || String(tableError);
        if (
          errorMessage.includes('does not exist') ||
          errorMessage.includes('relation') ||
          errorMessage.includes('table')
        ) {
          tableChecks[tableName] = {
            exists: false,
            accessible: false,
            error: 'Table does not exist',
          };
          diagnostics.errors.push({
            type: 'MISSING_TABLE',
            message: `Table "${tableName}" does not exist`,
            impact: 'Authentication will fail',
            fix: 'Run database migrations: npm run db:migrate or apply migrations manually',
          });
        } else {
          tableChecks[tableName] = {
            exists: true,
            accessible: false,
            error: errorMessage,
          };
        }
      }
    }

    diagnostics.checks.database.tables = tableChecks;

    // Check if any tables are missing
    const missingTables = Object.entries(tableChecks)
      .filter(([_, check]: [string, any]) => !check.exists)
      .map(([name]) => name);

    if (missingTables.length > 0) {
      diagnostics.checks.database.status = 'error';
      diagnostics.recommendations.push({
        priority: 'high',
        action: 'Run database migrations',
        command: 'npm run db:migrate',
        details: `Missing tables: ${missingTables.join(', ')}`,
      });
    }
  } catch (dbError: any) {
    diagnostics.checks.database.connection = false;
    diagnostics.checks.database.status = 'error';
    diagnostics.checks.database.error = dbError.message || String(dbError);
    diagnostics.errors.push({
      type: 'DATABASE_CONNECTION_ERROR',
      message: dbError.message || 'Failed to connect to database',
      impact: 'All database operations will fail',
      fix: 'Check DATABASE_URL and ensure database is accessible from production server',
    });
  }

  // 3. Check Auth Configuration
  const envBaseURL = process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || 'not set';
  
  diagnostics.checks.auth = {
    status: 'checking',
    baseURL: envBaseURL,
    hasAuthInstance: !!auth,
  };

  try {
    // Check if baseURL is correct
    const expectedBaseURL = 'https://cesclair.store';
    const actualBaseURL = envBaseURL;

    if (actualBaseURL !== expectedBaseURL && !actualBaseURL.includes('localhost') && actualBaseURL !== 'not set') {
      diagnostics.warnings.push({
        type: 'AUTH_BASE_URL_MISMATCH',
        message: `Auth baseURL is "${actualBaseURL}" but should be "${expectedBaseURL}"`,
        impact: 'Authentication callbacks and cookies may not work correctly',
        fix: 'Set NEXT_PUBLIC_SITE_URL=https://cesclair.store',
      });
    } else if (actualBaseURL === 'not set') {
      diagnostics.errors.push({
        type: 'AUTH_BASE_URL_NOT_SET',
        message: 'NEXT_PUBLIC_SITE_URL or BETTER_AUTH_URL is not set',
        impact: 'Authentication will fail',
        fix: 'Set NEXT_PUBLIC_SITE_URL=https://cesclair.store',
      });
      diagnostics.checks.auth.status = 'error';
    } else {
      diagnostics.checks.auth.status = 'ok';
    }

    // Verify auth instance is initialized
    if (!auth) {
      diagnostics.errors.push({
        type: 'AUTH_NOT_INITIALIZED',
        message: 'Auth instance is not initialized',
        impact: 'Authentication will fail',
        fix: 'Check auth.ts configuration',
      });
      diagnostics.checks.auth.status = 'error';
    }
  } catch (authError: any) {
    diagnostics.checks.auth.status = 'error';
    diagnostics.checks.auth.error = authError.message || String(authError);
  }

  // Calculate overall status
  const hasErrors = diagnostics.errors.length > 0;
  const hasWarnings = diagnostics.warnings.length > 0;

  diagnostics.summary = {
    status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok',
    errors: diagnostics.errors.length,
    warnings: diagnostics.warnings.length,
    recommendations: diagnostics.recommendations.length,
  };

  // Return appropriate status code
  const statusCode = hasErrors ? 500 : hasWarnings ? 200 : 200;

  return NextResponse.json(diagnostics, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

