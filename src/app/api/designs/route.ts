import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designs, designers } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters - allow up to 10000 designs to be fetched (effectively all designs)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 10000);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    
    // Filter parameters
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const designerId = searchParams.get('designerId');

    // Build query with joins to include designer information
    let query = db
      .select({
        id: designs.id,
        designerId: designs.designerId,
        title: designs.title,
        description: designs.description,
        imageUrl: designs.imageUrl,
        category: designs.category,
        status: designs.status,
        createdAt: designs.createdAt,
        updatedAt: designs.updatedAt,
        designer: {
          id: designers.id,
          name: designers.name,
          email: designers.email,
          bio: designers.bio,
          portfolioUrl: designers.portfolioUrl,
          specialties: designers.specialties,
          avatarUrl: designers.avatarUrl,
        }
      })
      .from(designs)
      .leftJoin(designers, eq(designs.designerId, designers.id));

    // Build WHERE conditions
    const conditions = [];

    // Search condition - search in design fields and designer name/email
    if (search) {
      conditions.push(
        or(
          like(designs.title, `%${search}%`),
          like(designs.description, `%${search}%`),
          like(designs.category, `%${search}%`),
          like(designers.name, `%${search}%`),
          like(designers.email, `%${search}%`)
        )
      );
    }

    // Status filter
    if (status) {
      conditions.push(eq(designs.status, status));
    }

    // Category filter
    if (category) {
      conditions.push(eq(designs.category, category));
    }

    // Designer filter
    if (designerId) {
      const parsedDesignerId = parseInt(designerId);
      if (!isNaN(parsedDesignerId)) {
        conditions.push(eq(designs.designerId, parsedDesignerId));
      }
    }

    // Apply conditions if any exist
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    // Execute query with pagination and ordering
    const results = await query
      .orderBy(desc(designs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
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
    const { designerId, title, description, imageUrl, category, status } = body;

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

    // Prepare insert data
    const now = new Date();
    const insertData = {
      designerId: parsedDesignerId,
      title: title.trim(),
      description: description?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      category: category?.trim() || null,
      status: status || 'draft',
      createdAt: now,
      updatedAt: now,
    };

    // Insert new design
    const newDesign = await db
      .insert(designs)
      .values(insertData)
      .returning();

    // Fetch the created design with designer information
    const createdDesign = await db
      .select({
        id: designs.id,
        designerId: designs.designerId,
        title: designs.title,
        description: designs.description,
        imageUrl: designs.imageUrl,
        category: designs.category,
        status: designs.status,
        createdAt: designs.createdAt,
        updatedAt: designs.updatedAt,
        designer: {
          id: designers.id,
          name: designers.name,
          email: designers.email,
          bio: designers.bio,
          portfolioUrl: designers.portfolioUrl,
          specialties: designers.specialties,
          avatarUrl: designers.avatarUrl,
        }
      })
      .from(designs)
      .leftJoin(designers, eq(designs.designerId, designers.id))
      .where(eq(designs.id, newDesign[0].id))
      .limit(1);

    return NextResponse.json(createdDesign[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}