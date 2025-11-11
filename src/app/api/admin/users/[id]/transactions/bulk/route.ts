import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user, CesworldMembers, CesworldTransactions, auditLogs } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

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

// Parse CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// POST bulk upload transactions from CSV
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess(request);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error, code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id: userId } = await params;
    const body = await request.json();
    const { csvContent } = body;

    if (!csvContent || typeof csvContent !== 'string') {
      return NextResponse.json(
        { error: 'CSV content is required', code: 'MISSING_CSV' },
        { status: 400 }
      );
    }

    // Check if user exists
    const targetUser = await db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (targetUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get or create membership
    let membership = await db
      .select()
      .from(CesworldMembers)
      .where(eq(CesworldMembers.userId, userId))
      .limit(1);

    if (membership.length === 0) {
      // Create new membership
      const newMembership = await db
        .insert(CesworldMembers)
        .values({
          userId: userId,
          tier: 'member',
          points: 0,
          annualSpending: '0.00',
          joinedAt: sql`now()`,
          lastTierUpdate: sql`now()`,
        })
        .returning();
      membership = newMembership;
    }

    const memberId = membership[0].id;
    const oldPoints = membership[0].points;
    const oldSpending = parseFloat(membership[0].annualSpending);

    // Parse CSV
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV must have at least a header and one data row', code: 'INVALID_CSV' },
        { status: 400 }
      );
    }

    // Parse header
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    
    // Expected CSV format: type, amount, points, description, orderId (optional), createdAt (optional)
    const typeIndex = headers.findIndex(h => h.includes('type'));
    const amountIndex = headers.findIndex(h => h.includes('amount'));
    const pointsIndex = headers.findIndex(h => h.includes('point'));
    const descriptionIndex = headers.findIndex(h => h.includes('description'));
    const orderIdIndex = headers.findIndex(h => h.includes('order'));
    const createdAtIndex = headers.findIndex(h => h.includes('created') || h.includes('date'));

    if (typeIndex === -1 || amountIndex === -1 || pointsIndex === -1 || descriptionIndex === -1) {
      return NextResponse.json(
        { error: 'CSV must contain: type, amount, points, description columns', code: 'INVALID_CSV_FORMAT' },
        { status: 400 }
      );
    }

    // Parse transactions
    const transactions: any[] = [];
    const errors: string[] = [];
    let totalPoints = 0;
    let totalSpending = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        
        const type = values[typeIndex]?.trim();
        const amountStr = values[amountIndex]?.trim().replace(/[$,]/g, '');
        const pointsStr = values[pointsIndex]?.trim();
        const description = values[descriptionIndex]?.trim();
        const orderId = orderIdIndex !== -1 ? values[orderIdIndex]?.trim() : null;
        const createdAt = createdAtIndex !== -1 ? values[createdAtIndex]?.trim() : null;

        // Validate required fields
        if (!type || !amountStr || pointsStr === undefined || !description) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }

        // Validate type
        const validTypes = ['purchase', 'redeem', 'bonus', 'birthday_reward', 'refund'];
        if (!validTypes.includes(type.toLowerCase())) {
          errors.push(`Row ${i + 1}: Invalid type "${type}". Must be one of: ${validTypes.join(', ')}`);
          continue;
        }

        // Validate amount (can be negative for refunds)
        const amount = parseFloat(amountStr);
        if (isNaN(amount)) {
          errors.push(`Row ${i + 1}: Invalid amount "${amountStr}"`);
          continue;
        }

        // Validate points
        const points = parseInt(pointsStr);
        if (isNaN(points)) {
          errors.push(`Row ${i + 1}: Invalid points "${pointsStr}"`);
          continue;
        }

        // Parse date if provided
        let transactionDate = sql`now()`;
        if (createdAt) {
          try {
            const date = new Date(createdAt);
            if (!isNaN(date.getTime())) {
              transactionDate = date as any;
            }
          } catch (e) {
            // Use current date if invalid
          }
        }

        // Store amount as absolute value in database (schema expects text, positive value)
        const storedAmount = Math.abs(amount).toFixed(2);
        
        transactions.push({
          memberId: memberId,
          type: type.toLowerCase(),
          amount: storedAmount,
          points: points,
          description: description,
          orderId: orderId || null,
          createdAt: transactionDate,
        });

        // Calculate totals based on transaction type
        const transactionType = type.toLowerCase();
        if (transactionType === 'purchase') {
          // Purchases increase spending
          totalSpending += Math.abs(amount);
        } else if (transactionType === 'refund') {
          // Refunds decrease spending (subtract the refunded amount)
          totalSpending -= Math.abs(amount);
        }
        // All transaction types affect points
        totalPoints += points;

      } catch (error: any) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'No valid transactions found in CSV', errors },
        { status: 400 }
      );
    }

    // Insert transactions
    try {
      await db.insert(CesworldTransactions).values(transactions);
    } catch (dbError: any) {
      console.error('Error inserting transactions:', dbError);
      return NextResponse.json(
        { error: 'Failed to insert transactions: ' + dbError.message },
        { status: 500 }
      );
    }

    // Update membership points and spending
    const newPoints = Math.max(0, oldPoints + totalPoints); // Ensure points don't go negative
    const newSpending = Math.max(0, oldSpending + totalSpending).toFixed(2); // Ensure spending doesn't go negative
    
    // Recalculate tier based on new spending
    const spendingAmount = parseFloat(newSpending);
    let calculatedTier: string;
    if (spendingAmount < 500) {
      calculatedTier = 'member';
    } else if (spendingAmount < 1000) {
      calculatedTier = 'plus';
    } else {
      calculatedTier = 'premier';
    }

    const updateData: any = {
      points: newPoints,
      annualSpending: newSpending,
    };

    // Update tier if it changed
    if (membership[0].tier !== calculatedTier) {
      updateData.tier = calculatedTier;
      updateData.lastTierUpdate = sql`now()`;
    }

    const updatedMembership = await db
      .update(CesworldMembers)
      .set(updateData)
      .where(eq(CesworldMembers.id, memberId))
      .returning();

    // Create audit log entry
    try {
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      const auditDetails = JSON.stringify({
        transactionsCount: transactions.length,
        pointsAdded: totalPoints,
        spendingAdded: parseFloat(totalSpending.toFixed(2)),
        oldPoints,
        newPoints,
        oldSpending: parseFloat(oldSpending.toFixed(2)),
        newSpending: parseFloat(newSpending),
        targetUserEmail: targetUser[0].email,
        targetUserName: targetUser[0].name,
      });

      await db.insert(auditLogs).values({
        action: 'bulk_transactions_upload',
        performedBy: accessCheck.userId!,
        targetUserId: userId,
        details: auditDetails,
        ipAddress,
        userAgent,
        createdAt: sql`now()`,
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
    }

    return NextResponse.json(
      { 
        message: `Successfully uploaded ${transactions.length} transactions`,
        transactionsCreated: transactions.length,
        errors: errors.length > 0 ? errors : undefined,
        membership: updatedMembership[0],
      },
      { status: errors.length > 0 ? 207 : 201 } // 207 Multi-Status if there were errors
    );
  } catch (error: any) {
    console.error('POST bulk transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

