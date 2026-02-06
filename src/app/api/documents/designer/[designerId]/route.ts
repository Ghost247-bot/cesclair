import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { documents, designers, user } from '@/db/schema';
import { eq, desc, and, isNotNull, isNull } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ designerId: string }> }
) {
  try {
    const { designerId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Filter parameters
    const category = searchParams.get('category');
    const uploadedBy = searchParams.get('uploadedBy'); // 'designer' or 'admin'

    // Validate designerId
    if (!designerId || isNaN(parseInt(designerId))) {
      return NextResponse.json(
        {
          error: 'Valid designer ID is required',
          code: 'INVALID_DESIGNER_ID',
        },
        { status: 400 }
      );
    }

    const parsedDesignerId = parseInt(designerId);

    // Check if designer exists
    const designer = await db
      .select()
      .from(designers)
      .where(eq(designers.id, parsedDesignerId))
      .limit(1);

    if (designer.length === 0) {
      return NextResponse.json(
        {
          error: 'Designer not found',
          code: 'DESIGNER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Build query
    let query = db
      .select({
        id: documents.id,
        designerId: documents.designerId,
        uploadedBy: documents.uploadedBy,
        title: documents.title,
        description: documents.description,
        fileName: documents.fileName,
        fileUrl: documents.fileUrl,
        fileSize: documents.fileSize,
        fileType: documents.fileType,
        category: documents.category,
        uploadedAt: documents.uploadedAt,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        designer: {
          id: designers.id,
          name: designers.name,
          email: designers.email,
        },
        uploader: {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      })
      .from(documents)
      .leftJoin(designers, eq(documents.designerId, designers.id))
      .leftJoin(user, eq(documents.uploadedBy, user.id))
      .where(eq(documents.designerId, parsedDesignerId));

    // Apply additional filters
    const conditions = [eq(documents.designerId, parsedDesignerId)];

    if (category) {
      conditions.push(eq(documents.category, category));
    }

    if (uploadedBy === 'designer') {
      // null means uploaded by designer
      conditions.push(isNull(documents.uploadedBy));
    } else if (uploadedBy === 'admin') {
      conditions.push(isNotNull(documents.uploadedBy));
    }

    query = query.where(and(...conditions)) as any;

    // Order by uploaded date descending
    const result = await query.orderBy(desc(documents.uploadedAt));

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('GET designer documents error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

