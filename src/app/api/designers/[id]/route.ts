import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const designer = await db
      .select()
      .from(designers)
      .where(eq(designers.id, parseInt(id)))
      .limit(1);

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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
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
      status,
    } = body;

    const updates: any = {
      updatedAt: new Date(), // Use Date object, not ISO string
    };

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

    if (bio !== undefined) {
      updates.bio = bio;
    }

    if (portfolioUrl !== undefined) {
      updates.portfolioUrl = portfolioUrl;
    }

    if (specialties !== undefined) {
      updates.specialties = specialties;
    }

    if (avatarUrl !== undefined) {
      updates.avatarUrl = avatarUrl;
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
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

    const deleted = await db
      .delete(designers)
      .where(eq(designers.id, parseInt(id)))
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