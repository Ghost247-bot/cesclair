import { NextRequest, NextResponse } from 'next/server';

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

    // Convert file to base64 for database storage (serverless compatible)
    // For production, you should use a cloud storage service (S3, Cloudinary, etc.)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');

    // Check if base64 data is too large (safety check)
    if (base64Data.length > 50 * 1024 * 1024) { // 50MB base64 limit
      return NextResponse.json(
        { error: 'File is too large to store. Please use a smaller file or cloud storage.', code: 'FILE_TOO_LARGE' },
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

