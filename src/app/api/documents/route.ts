import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { documents, designers, user } from '@/db/schema';
import { eq, desc, and, isNotNull, isNull } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filter parameters
    const designerId = searchParams.get('designerId');
    const category = searchParams.get('category');
    const uploadedBy = searchParams.get('uploadedBy'); // 'designer' or 'admin'

    // Build query with joins
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
      .leftJoin(user, eq(documents.uploadedBy, user.id));

    // Build WHERE conditions
    const conditions = [];

    // Designer filter
    if (designerId) {
      const parsedDesignerId = parseInt(designerId);
      if (!isNaN(parsedDesignerId)) {
        conditions.push(eq(documents.designerId, parsedDesignerId));
      }
    }

    // Category filter
    if (category) {
      conditions.push(eq(documents.category, category));
    }

    // Uploaded by filter
    if (uploadedBy === 'designer') {
      conditions.push(isNull(documents.uploadedBy)); // null means uploaded by designer
    } else if (uploadedBy === 'admin') {
      conditions.push(isNotNull(documents.uploadedBy));
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    // Order by uploaded date descending
    const result = await query.orderBy(desc(documents.uploadedAt));

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('GET documents error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { designerId, uploadedBy, title, description, fileName, fileUrl, fileSize, fileType, category } = body;

    // Validate required fields
    if (!designerId) {
      return NextResponse.json(
        { 
          error: 'Designer ID is required',
          code: 'MISSING_DESIGNER_ID'
        },
        { status: 400 }
      );
    }

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Title is required',
          code: 'MISSING_TITLE'
        },
        { status: 400 }
      );
    }

    if (!fileName || !fileUrl) {
      return NextResponse.json(
        { 
          error: 'File name and URL are required',
          code: 'MISSING_FILE_INFO'
        },
        { status: 400 }
      );
    }

    // Validate designerId is a valid integer
    const parsedDesignerId = parseInt(designerId);
    if (isNaN(parsedDesignerId)) {
      return NextResponse.json(
        { 
          error: 'Designer ID must be a valid number',
          code: 'INVALID_DESIGNER_ID'
        },
        { status: 400 }
      );
    }

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
          code: 'DESIGNER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Validate uploadedBy if provided
    if (uploadedBy) {
      const uploader = await db
        .select()
        .from(user)
        .where(eq(user.id, uploadedBy))
        .limit(1);

      if (uploader.length === 0) {
        return NextResponse.json(
          { 
            error: 'Uploader user not found',
            code: 'UPLOADER_NOT_FOUND'
          },
          { status: 404 }
        );
      }
    }

    // Prepare insert data
    const now = new Date();
    const insertData = {
      designerId: parsedDesignerId,
      uploadedBy: uploadedBy || null,
      title: title.trim(),
      description: description?.trim() || null,
      fileName: fileName.trim(),
      fileUrl: fileUrl.trim(),
      fileSize: fileSize || null,
      fileType: fileType || null,
      category: category?.trim() || null,
      uploadedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    // Insert new document
    const newDocument = await db
      .insert(documents)
      .values(insertData)
      .returning();

    // Fetch the created document with related information
    const createdDocument = await db
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
      .where(eq(documents.id, newDocument[0].id))
      .limit(1);

    return NextResponse.json(createdDocument[0], { status: 201 });
  } catch (error) {
    console.error('POST documents error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

