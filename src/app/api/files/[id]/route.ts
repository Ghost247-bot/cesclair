import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || isNaN(parseInt(id))) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Fetch file from database using raw SQL for better performance with large files
    const { Pool } = await import('@neondatabase/serverless');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    try {
      const result = await pool.query(
        'SELECT file_name, file_type, file_data, file_size FROM file_storage WHERE id = $1 LIMIT 1',
        [parseInt(id)]
      );

      if (result.rows.length === 0) {
        return new NextResponse('File not found', { status: 404 });
      }

      const fileRecord = result.rows[0];
      
      // Convert base64 back to buffer
      const buffer = Buffer.from(fileRecord.file_data, 'base64');

      // Return file with proper content type
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': fileRecord.file_type,
          'Content-Length': fileRecord.file_size.toString(),
          'Content-Disposition': `inline; filename="${fileRecord.file_name}"`,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } finally {
      await pool.end();
    }
  } catch (error) {
    console.error('File serving error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

