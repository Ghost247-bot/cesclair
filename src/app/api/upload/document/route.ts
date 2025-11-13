import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { fileStorage } from '@/db/schema';

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

    // Validate file size (max 10MB for documents stored in database)
    // Larger files should use cloud storage (S3, Cloudinary, etc.)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit. Please use a file smaller than 10MB or use cloud storage for larger files.', code: 'FILE_TOO_LARGE' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `document-${timestamp}-${randomString}.${fileExtension}`;

    try {
      // Convert file to base64 for database storage (serverless compatible)
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Data = buffer.toString('base64');

      // Check if base64 data is too large (safety check)
      if (base64Data.length > 50 * 1024 * 1024) { // 50MB base64 limit
        return NextResponse.json(
          { error: 'File is too large to store in database. Please use a smaller file or cloud storage.', code: 'FILE_TOO_LARGE' },
          { status: 400 }
        );
      }

      // Store file in database using raw SQL for better handling of large values
      const { Pool } = await import('@neondatabase/serverless');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      
      try {
        const result = await pool.query(
          `INSERT INTO file_storage (file_name, file_type, file_data, file_size, uploaded_at, created_at) 
           VALUES ($1, $2, $3, $4, NOW(), NOW()) 
           RETURNING id, file_name, file_type, file_size`,
          [fileName, file.type, base64Data, file.size]
        );

        const storedFile = result.rows[0];
        
        // Return the public URL (API endpoint to serve the file)
        const fileUrl = `/api/files/${storedFile.id}`;

        return NextResponse.json(
          { 
            url: fileUrl,
            fileName: storedFile.file_name,
            originalFileName: file.name,
            size: storedFile.file_size,
            type: storedFile.file_type
          },
          { status: 200 }
        );
      } finally {
        await pool.end();
      }
    } catch (dbError: any) {
      console.error('Database insert error:', dbError);
      
      // Provide more specific error messages
      if (dbError.message?.includes('too large') || dbError.message?.includes('exceeds')) {
        return NextResponse.json(
          { 
            error: 'File is too large to store in database. Please use a file smaller than 10MB.',
            code: 'FILE_TOO_LARGE'
          },
          { status: 400 }
        );
      }
      
      throw dbError; // Re-throw to be caught by outer catch
    }

  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to upload file';
    let errorCode = 'UPLOAD_ERROR';
    
    if (error.message?.includes('too large') || error.message?.includes('exceeds')) {
      errorMessage = 'File is too large. Please use a file smaller than 10MB.';
      errorCode = 'FILE_TOO_LARGE';
    } else if (error.message?.includes('database') || error.message?.includes('query')) {
      errorMessage = 'Database error while storing file. Please try again or use a smaller file.';
      errorCode = 'DATABASE_ERROR';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: errorCode
      },
      { status: 500 }
    );
  }
}

