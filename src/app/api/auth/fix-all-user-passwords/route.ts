import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import bcryptjs from 'bcryptjs';

/**
 * This endpoint fixes all users with incompatible password hashes
 * by updating them to use bcryptjs (Better Auth's format).
 * 
 * Note: This requires the original passwords, which we don't have.
 * This endpoint is mainly for testing or when you know the passwords.
 * 
 * For production, users should re-register through Better Auth's signUp endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    // Get all users with account records
    const allAccounts = await db
      .select({
        userId: account.userId,
        email: user.email,
        password: account.password,
        accountId: account.id,
      })
      .from(account)
      .innerJoin(user, eq(account.userId, user.id))
      .where(eq(account.providerId, 'credential'));

    if (allAccounts.length === 0) {
      return NextResponse.json(
        { 
          message: 'No users found with credential accounts',
          fixed: 0,
          total: 0
        },
        { status: 200 }
      );
    }

    const results = {
      total: allAccounts.length,
      fixed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Check each account's password hash format
    for (const accountRecord of allAccounts) {
      try {
        const passwordHash = accountRecord.password;
        
        if (!passwordHash) {
          results.skipped++;
          results.errors.push(`${accountRecord.email}: No password hash found`);
          continue;
        }

        // Check if it's already in bcryptjs format (starts with $2a$ or $2b$)
        // Better Auth uses bcryptjs which typically uses $2a$ or $2b$ prefix
        const isBcryptjsFormat = passwordHash.startsWith('$2a$') || passwordHash.startsWith('$2b$');
        
        if (isBcryptjsFormat) {
          // Already in correct format
          results.skipped++;
          continue;
        }

        // If it's in bcrypt format (starts with $2y$), we need to convert it
        // But we can't convert without the original password
        // So we'll just mark it as needing attention
        if (passwordHash.startsWith('$2y$')) {
          results.errors.push(`${accountRecord.email}: Password hash is in bcrypt format, needs conversion (requires original password)`);
          results.skipped++;
          continue;
        }

        // Unknown format
        results.errors.push(`${accountRecord.email}: Unknown password hash format`);
        results.skipped++;
      } catch (error) {
        results.errors.push(`${accountRecord.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        results.skipped++;
      }
    }

    return NextResponse.json(
      { 
        message: 'Password hash check completed',
        ...results,
        note: 'To fix users, use /api/auth/fix-user-password with their email and password'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

