import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contracts, designers } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ designerId: string }> }
) {
  try {
    console.log('[Contracts API] Starting request...');
    
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      console.log('[Contracts API] Not authenticated');
      return NextResponse.json(
        {
          contracts: [],
          error: 'Not authenticated',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    console.log('[Contracts API] User authenticated:', session.user.email);
    const { designerId } = await params;
    console.log('[Contracts API] Designer ID:', designerId);

    // Validate and convert designerId to a Number
    if (!designerId || designerId.trim() === '') {
      return NextResponse.json(
        {
          contracts: [],
          error: 'Valid designer ID is required',
          code: 'INVALID_DESIGNER_ID',
        },
        { status: 400 }
      );
    }

    const designerIdNumber = Number(designerId);
    
    // Validate that the ID is numeric and valid
    if (isNaN(designerIdNumber) || !Number.isInteger(designerIdNumber) || designerIdNumber <= 0) {
      return NextResponse.json(
        {
          contracts: [],
          error: 'Designer ID must be a valid positive integer',
          code: 'INVALID_DESIGNER_ID',
        },
        { status: 400 }
      );
    }

    // Check user role and authorization
    const userRole = (session.user as any)?.role;
    const isAdmin = userRole === 'admin';
    const isDesigner = userRole === 'designer';
    const sessionEmail = session.user.email?.toLowerCase().trim();

    // If user is not admin, verify they can only access their own contracts
    if (!isAdmin) {
      if (!isDesigner) {
        return NextResponse.json(
          {
            contracts: [],
            error: 'Only designers and admins can view contracts',
            code: 'FORBIDDEN',
          },
          { status: 403 }
        );
      }

      // Verify the designer exists and matches the logged-in user's email
      if (!sessionEmail) {
        return NextResponse.json(
          {
            contracts: [],
            error: 'User email not found',
            code: 'MISSING_EMAIL',
          },
          { status: 400 }
        );
      }

      const designer = await db
        .select({ id: designers.id, email: designers.email })
        .from(designers)
        .where(eq(designers.email, sessionEmail))
        .limit(1);

      if (designer.length === 0) {
        return NextResponse.json(
          {
            contracts: [],
            error: 'Designer profile not found',
            code: 'DESIGNER_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      // Verify the requested designerId matches the logged-in designer's ID
      if (designer[0].id !== designerIdNumber) {
        return NextResponse.json(
          {
            contracts: [],
            error: 'You can only view your own contracts',
            code: 'FORBIDDEN',
          },
          { status: 403 }
        );
      }
    }

    // Extract query parameters and validate
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limitNumber = limitParam ? Number(limitParam) : 1000;
    // Allow up to 10000 contracts to be fetched (effectively all contracts for a designer)
    const limit = Math.min(
      (isNaN(limitNumber) || limitNumber <= 0) ? 1000 : limitNumber,
      10000
    );
    const offset = parseInt(searchParams.get('offset') ?? '0') || 0;
    const status = searchParams.get('status');

    // Build query - explicitly select only columns that exist
    const whereConditions = [eq(contracts.designerId, designerIdNumber)];
    
    if (status) {
      whereConditions.push(eq(contracts.status, status));
    }

    console.log('[Contracts API] Querying database for designer:', designerIdNumber);
    console.log('[Contracts API] Where conditions:', whereConditions.length);
    console.log('[Contracts API] Limit:', limit, 'Offset:', offset);

    // Try to select contractFileUrl, but handle if column doesn't exist
    let results;
    try {
      results = await db
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
          contractFileUrl: contracts.contractFileUrl,
        })
        .from(contracts)
        .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0])
        .orderBy(desc(contracts.createdAt))
        .limit(limit)
        .offset(offset);
      
      console.log('[Contracts API] Query successful, found', results?.length || 0, 'contracts');
    } catch (selectError: any) {
      // If contractFileUrl column doesn't exist, retry without it
      if (selectError?.message?.includes('contractFileUrl') || selectError?.message?.includes('contract_file_url')) {
        console.warn('contractFileUrl column not found, retrying without it');
        results = await db
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
      })
      .from(contracts)
      .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0])
      .orderBy(desc(contracts.createdAt))
      .limit(limit)
      .offset(offset);
      } else {
        // Re-throw if it's a different error
        throw selectError;
      }
    }

    // Ensure results is always an array
    if (!Array.isArray(results)) {
      console.warn('Query results is not an array, converting to array');
      return NextResponse.json({ contracts: [] }, { status: 200 });
    }

    // Map results to ensure all fields are properly formatted
    const formattedResults = results.map((result: any) => ({
      id: result.id,
      designerId: result.designerId,
      designId: result.designId,
      title: result.title,
      description: result.description,
      amount: result.amount,
      status: result.status,
      awardedAt: result.awardedAt ? new Date(result.awardedAt).toISOString() : null,
      completedAt: result.completedAt ? new Date(result.completedAt).toISOString() : null,
      createdAt: result.createdAt ? new Date(result.createdAt).toISOString() : null,
      envelopeId: result.envelopeId,
      envelopeStatus: result.envelopeStatus,
      signedAt: result.signedAt ? new Date(result.signedAt).toISOString() : null,
      envelopeUrl: result.envelopeUrl,
      contractFileUrl: result.contractFileUrl || null,
    }));

    console.log('[Contracts API] Returning', formattedResults.length, 'formatted contracts');
    // Always return { contracts: [] } format
    return NextResponse.json({ contracts: formattedResults }, { status: 200 });
  } catch (error) {
    console.error('[Contracts API] GET contracts by designer error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[Contracts API] Error details:', {
      message: errorMessage,
      stack: errorStack,
      error: error
    });
    // Return error with proper status code so frontend can handle it
    return NextResponse.json(
      {
        contracts: [],
        error: `Server error: ${errorMessage}`,
        code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}