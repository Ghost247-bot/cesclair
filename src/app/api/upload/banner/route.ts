import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { designers, fileStorage } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
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

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const designerId = formData.get('designerId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', code: 'MISSING_FILE' },
        { status: 400 }
      );
    }

    // Validate file type - only images
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images (JPEG, PNG, WebP, GIF) are allowed.', code: 'INVALID_FILE_TYPE' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for banners - larger than avatars)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit', code: 'FILE_TOO_LARGE' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `banner-${timestamp}-${randomString}.${fileExtension}`;

    // Convert file to base64 for database storage (serverless compatible)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');

    // Store file in database
    const storedFile = await db
      .insert(fileStorage)
      .values({
        fileName: fileName,
        fileType: file.type,
        fileData: base64Data,
        fileSize: file.size,
      })
      .returning();

    // Return the public URL (API endpoint to serve the file)
    const fileUrl = `/api/files/${storedFile[0].id}`;

    // Save to database if designer ID is provided or find designer by email
    try {
      let designerToUpdate;
      
      if (designerId) {
        // Update by designer ID
        designerToUpdate = await db
          .select()
          .from(designers)
          .where(eq(designers.id, parseInt(designerId)))
          .limit(1);
      } else {
        // Find designer by email from session
        designerToUpdate = await db
          .select()
          .from(designers)
          .where(eq(designers.email, session.user.email))
          .limit(1);
      }

      if (designerToUpdate.length > 0) {
        // Check authorization: user must be admin OR the designer themselves
        const userRole = (session.user as any)?.role;
        const isAdmin = userRole === 'admin';
        const isOwnProfile = designerToUpdate[0].email === session.user.email;

        if (isAdmin || isOwnProfile) {
          // Update bannerUrl in database
          await db
            .update(designers)
            .set({
              bannerUrl: fileUrl,
              updatedAt: new Date(),
            })
            .where(eq(designers.id, designerToUpdate[0].id));
        }
      }
    } catch (dbError) {
      // Log error but don't fail the upload - file is already saved
      console.error('Failed to save banner URL to database:', dbError);
    }

    return NextResponse.json(
      { 
        url: fileUrl,
        fileName: fileName,
        originalFileName: file.name,
        size: file.size,
        type: file.type
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Banner upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload banner: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'UPLOAD_ERROR'
      },
      { status: 500 }
    );
  }
}

