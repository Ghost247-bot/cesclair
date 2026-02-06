import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designs, contracts } from '@/db/schema';
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

    // Fetch design by ID
    const design = await db.select()
      .from(designs)
      .where(eq(designs.id, parseInt(id)))
      .limit(1);

    if (design.length === 0) {
      return NextResponse.json(
        { 
          error: 'Design not found',
          code: 'DESIGN_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(design[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
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

    // Check if design exists
    const existingDesign = await db.select()
      .from(designs)
      .where(eq(designs.id, parseInt(id)))
      .limit(1);

    if (existingDesign.length === 0) {
      return NextResponse.json(
        { 
          error: 'Design not found',
          code: 'DESIGN_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, description, imageUrl, category, status } = body;

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updatedAt: new Date()
    };

    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (imageUrl !== undefined) updates.imageUrl = imageUrl.trim();
    if (category !== undefined) updates.category = category.trim();
    if (status !== undefined) updates.status = status.trim();

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

    // Update design
    const updatedDesign = await db.update(designs)
      .set(updates)
      .where(eq(designs.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedDesign[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
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

    // Check if design exists
    const existingDesign = await db.select()
      .from(designs)
      .where(eq(designs.id, parseInt(id)))
      .limit(1);

    if (existingDesign.length === 0) {
      return NextResponse.json(
        { 
          error: 'Design not found',
          code: 'DESIGN_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Check if there are contracts referencing this design and count them
    const relatedContracts = await db.select()
      .from(contracts)
      .where(eq(contracts.designId, parseInt(id)));

    // If contracts exist, set their designId to null before deleting the design
    // This prevents foreign key constraint violations
    if (relatedContracts.length > 0) {
      await db.update(contracts)
        .set({ designId: null })
        .where(eq(contracts.designId, parseInt(id)));
    }

    // Delete design
    const deletedDesign = await db.delete(designs)
      .where(eq(designs.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Design deleted successfully',
        design: deletedDesign[0],
        contractsUpdated: relatedContracts.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}