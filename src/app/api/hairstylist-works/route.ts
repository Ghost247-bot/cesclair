import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/lib/auth';
import { getHairstylistSessionFromCookie } from '@/lib/hairstylist-session';

// Direct Neon connection - bypass db proxy for now
const connectionString = 'postgresql://neondb_owner:npg_Tpxjf7u6DCtH@ep-withered-shadow-a4gnj7n7-pooler.us-east-1.aws.neon.tech/neondb';
const sql = neon(connectionString);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 1000);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const hairstylistId = searchParams.get('hairstylistId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = sql`SELECT 
      hw.id, hw.hairstylist_id, hw.title, hw.description, hw.image_url, hw.category, hw.status, hw.created_at, hw.updated_at,
      h.id as hairstylist_id, h.name as hairstylist_name, h.email as hairstylist_email, h.bio as hairstylist_bio, h.specialties as hairstylist_specialties, h.avatar_url as hairstylist_avatar_url
    FROM hairstylist_works hw
    LEFT JOIN hairstylists h ON hw.hairstylist_id = h.id`;

    const conditions: any[] = [];
    
    if (hairstylistId) {
      conditions.push(sql`hw.hairstylist_id = ${parseInt(hairstylistId)}`);
    }
    
    if (status && status !== 'all') {
      conditions.push(sql`hw.status = ${status}`);
    }
    
    if (category) {
      conditions.push(sql`hw.category ILIKE ${'%' + category + '%'}`);
    }
    
    if (search && search.trim()) {
      const searchTerm = `%${search}%`;
      conditions.push(sql`(hw.title ILIKE ${searchTerm} OR hw.description ILIKE ${searchTerm})`);
    }

    // Apply conditions if any
    let finalQuery = query;
    if (conditions.length > 0) {
      finalQuery = sql`${query} WHERE ${conditions.reduce((acc, cond, idx) => 
        idx === 0 ? cond : sql`${acc} AND ${cond}`, conditions[0])}`;
    }

    const results = await sql`${finalQuery} ORDER BY hw.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    // Convert field names to camelCase for consistency
    const formattedResults = Array.isArray(results) ? results.map((row: any) => ({
      id: row.id,
      hairstylistId: row.hairstylist_id,
      title: row.title,
      description: row.description,
      imageUrl: row.image_url,
      category: row.category,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      hairstylist: {
        id: row.hairstylist_id,
        name: row.hairstylist_name,
        email: row.hairstylist_email,
        bio: row.hairstylist_bio,
        specialties: row.hairstylist_specialties,
        avatarUrl: row.hairstylist_avatar_url,
      },
    })) : [];

    return NextResponse.json(formattedResults, { status: 200 });
  } catch (error) {
    console.error('GET /api/hairstylist-works error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
