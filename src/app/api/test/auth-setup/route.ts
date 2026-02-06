import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Test Better Auth configuration
    const authConfig = {
      baseURL: process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || "http://localhost:3001",
      hasDatabase: !!auth,
    };
    
    // Check if we can query users
    const testUsers = await db
      .select({
        id: user.id,
        email: user.email,
        role: user.role,
        hasAccount: sql<boolean>`EXISTS(SELECT 1 FROM ${account} WHERE ${account.userId} = ${user.id})`,
      })
      .from(user)
      .limit(5);
    
    // Check account table structure
    const accountTableInfo = await db.execute(sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'account'
      ORDER BY ordinal_position
    `);
    
    return NextResponse.json({
      success: true,
      authConfig,
      users: {
        count: testUsers.length,
        sample: testUsers,
      },
      accountTable: {
        columns: accountTableInfo.rows,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Auth setup test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

