import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const testQuery = await db.execute(sql`SELECT 1 as test`);
    
    // Check if user table exists and has role column
    const userTableInfo = await db.execute(sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'user'
      ORDER BY ordinal_position
    `);
    
    // Check if there are any users
    const userCount = await db.select().from(user).limit(1);
    
    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        testQuery: testQuery.rows[0],
      },
      userTable: {
        columns: userTableInfo.rows,
        hasUsers: userCount.length > 0,
      },
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Database connection test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      },
    }, { status: 500 });
  }
}

