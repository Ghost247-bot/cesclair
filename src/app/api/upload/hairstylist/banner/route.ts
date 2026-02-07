import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { hairstylists, fileStorage } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can upload hairstylist banners', code: 'FORBIDDEN' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const hairstylistId = formData.get('hairstylistId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided', code: 'MISSING_FILE' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images allowed.', code: 'INVALID_FILE_TYPE' }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit', code: 'FILE_TOO_LARGE' }, { status: 400 });
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `hairstylist-banner-${timestamp}-${randomString}.${fileExtension}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');

    const [storedFile] = await db
      .insert(fileStorage)
      .values({ fileName, fileType: file.type, fileData: base64Data, fileSize: file.size })
      .returning();

    const fileUrl = `/api/files/${storedFile.id}`;

    if (hairstylistId) {
      const id = parseInt(hairstylistId, 10);
      if (!isNaN(id)) {
        await db
          .update(hairstylists)
          .set({ bannerUrl: fileUrl, updatedAt: new Date() })
          .where(eq(hairstylists.id, id));
      }
    }

    return NextResponse.json({ url: fileUrl, fileName, originalFileName: file.name, size: file.size, type: file.type }, { status: 200 });
  } catch (error) {
    console.error('Hairstylist banner upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload: ' + (error instanceof Error ? error.message : 'Unknown error'), code: 'UPLOAD_ERROR' },
      { status: 500 }
    );
  }
}
