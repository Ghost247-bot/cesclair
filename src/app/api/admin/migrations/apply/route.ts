import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { Pool } from '@neondatabase/serverless';

// Helper function to check admin access
async function checkAdminAccess(request: NextRequest) {
  try {
    let session;
    try {
      session = await auth.api.getSession({ headers: request.headers });
    } catch (sessionError) {
      console.error('Error getting session:', sessionError);
      return { authorized: false, error: 'Not authenticated' };
    }
    
    if (!session?.user) {
      return { authorized: false, error: 'Not authenticated' };
    }

    // Check if user is admin
    const { user } = await import('@/db/schema');
    const { eq } = await import('drizzle-orm');
    let userRole = (session.user as any)?.role;
    
    if (!userRole) {
      try {
        const dbUser = await db
          .select({ role: user.role })
          .from(user)
          .where(eq(user.id, session.user.id))
          .limit(1);
        
        if (dbUser.length > 0) {
          userRole = dbUser[0].role;
        }
      } catch (dbError) {
        console.error('Error fetching user role from database:', dbError);
        return { authorized: false, error: 'Failed to verify user role' };
      }
    }

    if (userRole !== 'admin') {
      return { authorized: false, error: 'Only administrators can access this endpoint' };
    }

    return { authorized: true, userId: session.user.id };
  } catch (error) {
    console.error('Error in checkAdminAccess:', error);
    return { authorized: false, error: 'Authentication check failed' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess(request);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error, code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { migration } = body;

    if (!migration || migration !== 'add_banner_url_to_designers') {
      return NextResponse.json(
        { error: 'Invalid migration name', code: 'INVALID_MIGRATION' },
        { status: 400 }
      );
    }

    // Get raw database connection to execute SQL
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
    
    try {
      // Check if column already exists
      const checkColumnQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'designers' AND column_name = 'banner_url';
      `;
      
      const columnCheck = await pool.query(checkColumnQuery);
      
      if (columnCheck.rows.length > 0) {
        await pool.end();
        return NextResponse.json(
          { 
            message: 'Migration already applied - banner_url column already exists',
            code: 'MIGRATION_ALREADY_APPLIED'
          },
          { status: 200 }
        );
      }

      // Apply migration
      const migrationSQL = 'ALTER TABLE "designers" ADD COLUMN "banner_url" text;';
      await pool.query(migrationSQL);
      
      await pool.end();
      
      return NextResponse.json(
        { 
          message: 'Migration applied successfully - banner_url column added to designers table',
          code: 'MIGRATION_APPLIED'
        },
        { status: 200 }
      );
    } catch (sqlError: any) {
      await pool.end();
      console.error('SQL migration error:', sqlError);
      return NextResponse.json(
        { 
          error: 'Migration failed: ' + sqlError.message,
          code: 'MIGRATION_FAILED',
          details: process.env.NODE_ENV === 'development' ? sqlError.stack : undefined
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('POST /api/admin/migrations/apply error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error?.message || 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

