import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { db } from '@/db';
import { fileStorage } from '@/db/schema';
import { like } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filePath = path.join('/');
    
    // First, try to serve from public directory
    const publicPath = join(process.cwd(), 'public', filePath);
    if (existsSync(publicPath)) {
      try {
        const fileBuffer = await readFile(publicPath);
        const ext = filePath.split('.').pop()?.toLowerCase() || 'jpg';
        const contentType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                           ext === 'png' ? 'image/png' :
                           ext === 'webp' ? 'image/webp' :
                           ext === 'gif' ? 'image/gif' : 'application/octet-stream';
        
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Length': fileBuffer.length.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      } catch (readError) {
        // Fall through to database lookup
      }
    }
    
    // If not in public, try database lookup
    // Extract filename from path (e.g., "uploads/banners/banner-xxx.jpg" -> "banner-xxx.jpg")
    const fileName = filePath.split('/').pop() || '';
    
    if (!fileName) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Try to find file in database by filename
    const files = await db
      .select()
      .from(fileStorage)
      .where(like(fileStorage.fileName, `%${fileName}%`))
      .limit(1);

    if (files.length === 0) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileRecord = files[0];
    
    // Convert base64 back to buffer
    const buffer = Buffer.from(fileRecord.fileData, 'base64');

    // Return file with proper content type
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': fileRecord.fileType || 'image/jpeg',
        'Content-Length': fileRecord.fileSize?.toString() || buffer.length.toString(),
        'Content-Disposition': `inline; filename="${fileRecord.fileName}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('File serving error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

