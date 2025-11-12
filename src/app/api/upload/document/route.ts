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

    // Validate file type - allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: PDF, Word, Excel, PowerPoint, Text, Images', code: 'INVALID_FILE_TYPE' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB for documents)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit', code: 'FILE_TOO_LARGE' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `document-${timestamp}-${randomString}.${fileExtension}`;

    // Save to public/uploads/documents directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'documents');
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    // Return the public URL
    const fileUrl = `/uploads/documents/${fileName}`;

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

