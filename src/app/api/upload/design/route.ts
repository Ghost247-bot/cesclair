import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', code: 'MISSING_FILE' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.', code: 'INVALID_FILE_TYPE' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
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
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `design-${timestamp}-${randomString}.${fileExtension}`;

    // For production, you should use a cloud storage service (S3, Cloudinary, etc.)
    // For now, we'll save to public/uploads/designs directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'designs');
    
    // Create directory if it doesn't exist
    try {
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
    } catch (dirError) {
      console.error('Error creating upload directory:', dirError);
      throw new Error('Failed to create upload directory');
    }

    const filePath = join(uploadDir, fileName);
    
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
    } catch (writeError) {
      console.error('Error writing file:', writeError);
      throw new Error('Failed to save file to disk');
    }

    // Return the public URL
    const fileUrl = `/uploads/designs/${fileName}`;

    return NextResponse.json(
      { 
        url: fileUrl,
        fileName: fileName,
        size: file.size,
        type: file.type
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload file: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'UPLOAD_ERROR'
      },
      { status: 500 }
    );
  }
}

