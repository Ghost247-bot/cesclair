import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { documents, designers, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Fetch document with related information
    const result = await db
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
      .where(eq(documents.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { 
          error: 'Document not found',
          code: 'DOCUMENT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error('GET document error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if document exists
    const existingDocument = await db
      .select()
      .from(documents)
      .where(eq(documents.id, parseInt(id)))
      .limit(1);

    if (existingDocument.length === 0) {
      return NextResponse.json(
        { 
          error: 'Document not found',
          code: 'DOCUMENT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Delete document
    await db
      .delete(documents)
      .where(eq(documents.id, parseInt(id)));

    return NextResponse.json(
      { message: 'Document deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE document error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if document exists
    const existingDocument = await db
      .select()
      .from(documents)
      .where(eq(documents.id, parseInt(id)))
      .limit(1);

    if (existingDocument.length === 0) {
      return NextResponse.json(
        { 
          error: 'Document not found',
          code: 'DOCUMENT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, description, category } = body;

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updatedAt: new Date()
    };

    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (category !== undefined) updates.category = category.trim();

    // Validate title if provided
    if (updates.title !== undefined && !updates.title) {
      return NextResponse.json(
        { 
          error: 'Title cannot be empty',
          code: 'INVALID_TITLE' 
        },
        { status: 400 }
      );
    }

    // Update document
    const updatedDocument = await db
      .update(documents)
      .set(updates)
      .where(eq(documents.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedDocument[0], { status: 200 });
  } catch (error) {
    console.error('PUT document error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

