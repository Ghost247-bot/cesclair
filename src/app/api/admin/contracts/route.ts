import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { contracts, designers, designs, user } from '@/db/schema';
import { eq, like, or, and, desc, sql } from 'drizzle-orm';

// Helper function to check admin access
async function checkAdminAccess(request: NextRequest) {
  try {
    // Get session with error handling
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

    // Check if user is admin - first check session, then database
    let userRole = (session.user as any)?.role;
    
    // If role is not in session, fetch from database
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

export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess(request);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error, code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 500);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const designerId = searchParams.get('designerId');

    // Build query with joins to include designer information
    let query = db
      .select({
        id: contracts.id,
        designerId: contracts.designerId,
        designId: contracts.designId,
        title: contracts.title,
        description: contracts.description,
        amount: contracts.amount,
        status: contracts.status,
        awardedAt: contracts.awardedAt,
        completedAt: contracts.completedAt,
        createdAt: contracts.createdAt,
        envelopeId: contracts.envelopeId,
        envelopeStatus: contracts.envelopeStatus,
        signedAt: contracts.signedAt,
        envelopeUrl: contracts.envelopeUrl,
        designer: {
          id: designers.id,
          name: designers.name,
          email: designers.email,
        },
      })
      .from(contracts)
      .leftJoin(designers, eq(contracts.designerId, designers.id));

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(contracts.title, `%${search}%`),
          like(contracts.description, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(contracts.status, status));
    }

    if (designerId) {
      const designerIdInt = parseInt(designerId);
      if (!isNaN(designerIdInt)) {
        conditions.push(eq(contracts.designerId, designerIdInt));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(contracts.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
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

    const body = await request.json();
    const { designerId, designId, title, description, amount, status, contractFileUrl } = body;

    // Validate required fields
    if (!designerId) {
      return NextResponse.json(
        { error: 'designerId is required', code: 'MISSING_DESIGNER_ID' },
        { status: 400 }
      );
    }

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'title is required', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    // Validate designerId is a valid integer
    const designerIdInt = parseInt(String(designerId));
    if (isNaN(designerIdInt) || designerIdInt <= 0) {
      return NextResponse.json(
        { error: 'designerId must be a valid positive integer', code: 'INVALID_DESIGNER_ID' },
        { status: 400 }
      );
    }

    // Validate designerId exists in designers table
    const designer = await db
      .select()
      .from(designers)
      .where(eq(designers.id, designerIdInt))
      .limit(1);

    if (designer.length === 0) {
      return NextResponse.json(
        { error: 'Designer not found', code: 'DESIGNER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate designId if provided
    let designIdInt = null;
    if (designId !== undefined && designId !== null && designId !== '') {
      designIdInt = parseInt(String(designId));
      if (isNaN(designIdInt) || designIdInt <= 0) {
        return NextResponse.json(
          { error: 'designId must be a valid positive integer', code: 'INVALID_DESIGN_ID' },
          { status: 400 }
        );
      }

      const design = await db
        .select()
        .from(designs)
        .where(eq(designs.id, designIdInt))
        .limit(1);

      if (design.length === 0) {
        return NextResponse.json(
          { error: 'Design not found', code: 'DESIGN_NOT_FOUND' },
          { status: 404 }
        );
      }
    }

    // Prepare insert data
    const now = new Date();
    const contractStatus = status || 'pending';
    
    const insertData: any = {
      designerId: designerIdInt,
      title: title.trim(),
      description: description ? description.trim() : null,
      amount: amount || null,
      status: contractStatus,
      createdAt: now,
    };

    // Only include designId if provided
    if (designIdInt !== null && designIdInt !== undefined) {
      insertData.designId = designIdInt;
    }

    // Set awardedAt if status is 'awarded'
    if (contractStatus === 'awarded') {
      insertData.awardedAt = now;
    }

    // Set completedAt if status is 'completed'
    if (contractStatus === 'completed') {
      insertData.completedAt = now;
    }

    // Try insert without contract_file_url first (column may not exist)
    // Only include contractFileUrl if provided AND we want to try with it
    const insertDataWithFile = contractFileUrl 
      ? { ...insertData, contractFileUrl } 
      : insertData;

    const returningFields = {
      id: contracts.id,
      designerId: contracts.designerId,
      designId: contracts.designId,
      title: contracts.title,
      description: contracts.description,
      amount: contracts.amount,
      status: contracts.status,
      awardedAt: contracts.awardedAt,
      completedAt: contracts.completedAt,
      createdAt: contracts.createdAt,
      envelopeId: contracts.envelopeId,
      envelopeStatus: contracts.envelopeStatus,
      signedAt: contracts.signedAt,
      envelopeUrl: contracts.envelopeUrl,
    };

    try {
      const newContract = await db
        .insert(contracts)
        .values(insertDataWithFile)
        .returning(returningFields);

      return NextResponse.json(newContract[0], { status: 201 });
    } catch (insertError: any) {
      // Handle case where contract_file_url column doesn't exist yet
      const errorMessage = String(insertError?.message || '');
      const errorCause = String(insertError?.cause?.message || '');
      const errorString = errorMessage + ' ' + errorCause;
      const hasContractFileUrlError = 
        errorString.includes('contract_file_url') ||
        errorString.includes('contractFileUrl') ||
        insertError?.code === '42703' ||
        insertError?.cause?.code === '42703';
      
      if (hasContractFileUrlError) {
        // Remove contractFileUrl and try again (Drizzle includes it from schema even if not provided)
        const insertDataWithoutFile = { ...insertData };
        delete insertDataWithoutFile.contractFileUrl;
        
        try {
          const newContract = await db
            .insert(contracts)
            .values(insertDataWithoutFile)
            .returning(returningFields);

          return NextResponse.json(newContract[0], { status: 201 });
        } catch (retryError: any) {
          const retryErrorMessage = String(retryError?.message || '');
          const retryErrorCause = String(retryError?.cause?.message || '');
          const retryErrorString = retryErrorMessage + ' ' + retryErrorCause;
          const retryHasContractFileUrlError = 
            retryErrorString.includes('contract_file_url') ||
            retryErrorString.includes('contractFileUrl') ||
            retryError?.code === '42703' ||
            retryError?.cause?.code === '42703';
          
          if (retryHasContractFileUrlError) {
            // Column definitely doesn't exist, Drizzle is including it from schema
            // Use raw SQL to insert without the contract_file_url column
            console.warn('contract_file_url column does not exist in database, using raw SQL insert');
            
            // Build dynamic SQL with only columns that exist
            const columns: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;
            
            columns.push('designer_id');
            values.push(insertData.designerId);
            paramIndex++;
            
            columns.push('title');
            values.push(insertData.title);
            paramIndex++;
            
            if (insertData.description !== undefined && insertData.description !== null) {
              columns.push('description');
              values.push(insertData.description);
              paramIndex++;
            }
            
            if (insertData.amount !== undefined && insertData.amount !== null) {
              columns.push('amount');
              values.push(insertData.amount);
              paramIndex++;
            }
            
            columns.push('status');
            values.push(insertData.status);
            paramIndex++;
            
            columns.push('created_at');
            values.push(insertData.createdAt);
            paramIndex++;
            
            if (insertData.designId !== undefined && insertData.designId !== null) {
              columns.push('design_id');
              values.push(insertData.designId);
              paramIndex++;
            }
            
            if (insertData.awardedAt !== undefined && insertData.awardedAt !== null) {
              columns.push('awarded_at');
              values.push(insertData.awardedAt);
              paramIndex++;
            }
            
            if (insertData.completedAt !== undefined && insertData.completedAt !== null) {
              columns.push('completed_at');
              values.push(insertData.completedAt);
              paramIndex++;
            }
            
            // Build parameterized SQL query
            const columnsStr = columns.join(', ');
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
            
            // Format values for SQL (escape strings, format dates, etc.)
            const formattedValues = values.map(v => {
              if (v === null || v === undefined) return null;
              if (v instanceof Date) return v.toISOString();
              if (typeof v === 'string') return v.replace(/'/g, "''");
              return v;
            });
            
            // Construct SQL with proper escaping
            const valuesStr = formattedValues.map((v, i) => {
              if (v === null) return 'NULL';
              if (typeof v === 'string') return `'${v}'`;
              if (v instanceof Date) return `'${v.toISOString()}'`;
              return String(v);
            }).join(', ');
            
            const query = sql`
              INSERT INTO contracts (${sql.raw(columnsStr)})
              VALUES (${sql.raw(valuesStr)})
              RETURNING id, designer_id, design_id, title, description, amount, status, 
                        awarded_at, completed_at, created_at, envelope_id, envelope_status, 
                        signed_at, envelope_url
            `;
            
            const result = await db.execute(query);
            
            const newContract = result.rows[0] as any;
            return NextResponse.json({
              id: newContract.id,
              designerId: newContract.designer_id,
              designId: newContract.design_id,
              title: newContract.title,
              description: newContract.description,
              amount: newContract.amount,
              status: newContract.status,
              awardedAt: newContract.awarded_at,
              completedAt: newContract.completed_at,
              createdAt: newContract.created_at,
              envelopeId: newContract.envelope_id,
              envelopeStatus: newContract.envelope_status,
              signedAt: newContract.signed_at,
              envelopeUrl: newContract.envelope_url,
            }, { status: 201 });
          }
          throw retryError;
        }
      }
      throw insertError;
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

