import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contracts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Fetch contract by ID
    const contract = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, parseInt(id)))
      .limit(1);

    if (contract.length === 0) {
      return NextResponse.json(
        { error: 'Contract not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(contract[0], { status: 200 });
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
    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if contract exists
    const existingContract = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, parseInt(id)))
      .limit(1);

    if (existingContract.length === 0) {
      return NextResponse.json(
        { error: 'Contract not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, description, amount, status, designId } = body;

    // Prepare update data
    const updates: {
      title?: string;
      description?: string;
      amount?: string;
      status?: string;
      designId?: number | null;
      awardedAt?: string;
      completedAt?: string;
    } = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (amount !== undefined) updates.amount = amount;
    if (designId !== undefined) updates.designId = designId;

    // Handle status updates with timestamp logic
    if (status !== undefined) {
      updates.status = status;

      // Set awardedAt when status changes to 'awarded'
      if (status === 'awarded' && existingContract[0].status !== 'awarded') {
        updates.awardedAt = new Date().toISOString();
      }

      // Set completedAt when status changes to 'completed'
      if (status === 'completed' && existingContract[0].status !== 'completed') {
        updates.completedAt = new Date().toISOString();
      }
    }

    // Validate that we have at least one field to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    // Perform update
    const updated = await db
      .update(contracts)
      .set(updates)
      .where(eq(contracts.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Contract not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
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
    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if contract exists before deleting
    const existingContract = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, parseInt(id)))
      .limit(1);

    if (existingContract.length === 0) {
      return NextResponse.json(
        { error: 'Contract not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete contract
    const deleted = await db
      .delete(contracts)
      .where(eq(contracts.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Contract deleted successfully',
        contract: deleted[0]
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