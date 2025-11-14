import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designers, user, contracts, designs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: 'ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    let designer;

    // Try to parse as numeric ID first (designer ID)
    if (!isNaN(parseInt(id))) {
      designer = await db
        .select()
        .from(designers)
        .where(eq(designers.id, parseInt(id)))
        .limit(1);
    } else {
      // If not numeric, try to look up by user ID (find user, then find designer by email)
      const userRecord = await db
        .select()
        .from(user)
        .where(eq(user.id, id))
        .limit(1);

      if (userRecord.length === 0) {
        return NextResponse.json(
          {
            error: 'Designer not found. Please use a numeric designer ID.',
            code: 'DESIGNER_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      // Find designer by email
      designer = await db
        .select()
        .from(designers)
        .where(eq(designers.email, userRecord[0].email))
        .limit(1);
    }

    if (designer.length === 0) {
      return NextResponse.json(
        { error: 'Designer not found' },
        { status: 404 }
      );
    }

    const { password, ...designerWithoutPassword } = designer[0];

    return NextResponse.json(designerWithoutPassword, { status: 200 });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: 'ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    // Only numeric designer IDs are supported for PUT/DELETE operations
    if (isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Numeric designer ID is required for updates',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    // Check authentication
    let session;
    try {
      session = await auth.api.getSession({ headers: request.headers });
    } catch (sessionError) {
      return NextResponse.json(
        { error: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const existingDesigner = await db
      .select()
      .from(designers)
      .where(eq(designers.id, parseInt(id)))
      .limit(1);

    if (existingDesigner.length === 0) {
      return NextResponse.json(
        { error: 'Designer not found' },
        { status: 404 }
      );
    }

    // Check authorization: user must be admin OR the designer themselves
    const userRole = (session.user as any)?.role;
    const isAdmin = userRole === 'admin';
    const isDesigner = userRole === 'designer';
    const isOwnProfile = isDesigner && existingDesigner[0].email === session.user.email;

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json(
        { error: 'You can only update your own profile', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      password,
      bio,
      portfolioUrl,
      specialties,
      avatarUrl,
      bannerUrl,
      status,
    } = body;

    const updates: any = {
      updatedAt: new Date(), // Use Date object, not ISO string
    };

    // Portfolio-related fields can only be updated by admins
    const portfolioFields = ['bio', 'portfolioUrl', 'specialties', 'avatarUrl', 'bannerUrl'];
    const requestedPortfolioFields = Object.keys(body).filter(key => 
      portfolioFields.includes(key) && body[key] !== undefined
    );

    if (requestedPortfolioFields.length > 0 && !isAdmin) {
      return NextResponse.json(
        { 
          error: 'Only administrators can update portfolio information (bio, specialties, avatar, banner, portfolio URL)', 
          code: 'FORBIDDEN' 
        },
        { status: 403 }
      );
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          {
            error: 'Name must be a non-empty string',
            code: 'INVALID_NAME',
          },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || email.trim().length === 0) {
        return NextResponse.json(
          {
            error: 'Email must be a non-empty string',
            code: 'INVALID_EMAIL',
          },
          { status: 400 }
        );
      }
      const normalizedEmail = email.toLowerCase().trim();

      if (normalizedEmail !== existingDesigner[0].email) {
        const emailExists = await db
          .select()
          .from(designers)
          .where(eq(designers.email, normalizedEmail))
          .limit(1);

        if (emailExists.length > 0) {
          return NextResponse.json(
            {
              error: 'Email already exists',
              code: 'EMAIL_CONFLICT',
            },
            { status: 409 }
          );
        }
      }

      updates.email = normalizedEmail;
    }

    if (password !== undefined) {
      if (typeof password !== 'string' || password.length < 6) {
        return NextResponse.json(
          {
            error: 'Password must be at least 6 characters',
            code: 'INVALID_PASSWORD',
          },
          { status: 400 }
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }

    // Portfolio fields - only admins can update
    if (bio !== undefined && isAdmin) {
      updates.bio = bio;
    }

    if (portfolioUrl !== undefined && isAdmin) {
      updates.portfolioUrl = portfolioUrl;
    }

    if (specialties !== undefined && isAdmin) {
      updates.specialties = specialties;
    }

    if (avatarUrl !== undefined && isAdmin) {
      updates.avatarUrl = avatarUrl;
    }

    if (bannerUrl !== undefined && isAdmin) {
      updates.bannerUrl = bannerUrl;
    }

    // Only admins can update status
    if (status !== undefined && isAdmin) {
      updates.status = status;
    }

    const updated = await db
      .update(designers)
      .set(updates)
      .where(eq(designers.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update designer' },
        { status: 500 }
      );
    }

    const { password: _, ...updatedDesignerWithoutPassword } = updated[0];

    return NextResponse.json(updatedDesignerWithoutPassword, { status: 200 });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: 'ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    // Only numeric designer IDs are supported for DELETE operations
    if (isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Numeric designer ID is required for deletion',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    // Check authentication
    let session;
    try {
      session = await auth.api.getSession({ headers: request.headers });
    } catch (sessionError) {
      return NextResponse.json(
        { error: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userRole = (session.user as any)?.role;
    const isAdmin = userRole === 'admin';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only administrators can delete designers', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const existingDesigner = await db
      .select()
      .from(designers)
      .where(eq(designers.id, parseInt(id)))
      .limit(1);

    if (existingDesigner.length === 0) {
      return NextResponse.json(
        { error: 'Designer not found' },
        { status: 404 }
      );
    }

    const designerId = parseInt(id);

    // Check for related data
    const relatedDesigns = await db.select()
      .from(designs)
      .where(eq(designs.designerId, designerId));

    const relatedContracts = await db.select()
      .from(contracts)
      .where(eq(contracts.designerId, designerId));

    // Delete related designs first (this will also handle designId references in contracts)
    // For each design, we need to set designId to null in contracts before deleting
    for (const design of relatedDesigns) {
      // Set designId to null in contracts that reference this design
      await db.update(contracts)
        .set({ designId: null })
        .where(eq(contracts.designId, design.id));
      
      // Delete the design
      await db.delete(designs)
        .where(eq(designs.id, design.id));
    }

    // Delete all contracts for this designer
    if (relatedContracts.length > 0) {
      await db.delete(contracts)
        .where(eq(contracts.designerId, designerId));
    }

    // Now delete the designer (documents will be cascade deleted due to onDelete: 'cascade')
    const deleted = await db
      .delete(designers)
      .where(eq(designers.id, designerId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete designer' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Designer deleted successfully',
        deletedDesigner: {
          id: deleted[0].id,
          name: deleted[0].name,
          email: deleted[0].email,
        },
        deletedDesigns: relatedDesigns.length,
        deletedContracts: relatedContracts.length,
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