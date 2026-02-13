import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/index';
import { reviews, products, user } from '@/db/schema';
import { eq, and, desc, asc, count } from 'drizzle-orm';
import { authClient } from '@/lib/auth-client';
import type { ExtendedSession } from '@/lib/auth-client';

// GET /api/admin/reviews - Fetch all reviews for admin management
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const status = searchParams.get('status') || 'all'; // all, pending, approved, rejected

    // Build where conditions
    let whereConditions: any[] = [];
    
    if (status !== 'all') {
      switch (status) {
        case 'pending':
          whereConditions.push(eq(reviews.approved, false));
          break;
        case 'approved':
          whereConditions.push(eq(reviews.approved, true));
          break;
        case 'rejected':
          whereConditions.push(eq(reviews.approved, false));
          break;
      }
    }

    // Fetch reviews with user info
    const result = await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        verified: reviews.verified,
        approved: reviews.approved,
        helpful: reviews.helpful,
        notHelpful: reviews.notHelpful,
        size: reviews.size,
        color: reviews.color,
        images: reviews.images,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        author: user.name,
        authorEmail: user.email,
        productName: products.name,
      })
      .from(reviews)
      .leftJoin(user, eq(reviews.userId, user.id))
      .leftJoin(products, eq(reviews.productId, products.id))
      .where(and(...whereConditions))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);

    const reviewsData = result.map((row: any) => ({
      id: row.id.toString(),
      productId: row.productId.toString(),
      author: row.author || 'Anonymous',
      authorEmail: row.authorEmail,
      rating: row.rating,
      title: row.title,
      content: row.content,
      verified: row.verified,
      approved: row.approved,
      helpful: row.helpful,
      notHelpful: row.notHelpful,
      size: row.size,
      color: row.color,
      images: row.images ? JSON.parse(row.images) : [],
      productName: row.productName,
      date: new Date(row.createdAt).toLocaleDateString(),
    }));

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(...whereConditions));

    const totalCount = Number(totalCountResult.rows[0]?.count || 0);

    return NextResponse.json({
      reviews: reviewsData,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/reviews/[id] - Approve or reject a review
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { approved } = body;

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'approved field must be boolean' },
        { status: 400 }
      );
    }

    // Update the review approval status
    const updatedReview = await db
      .update(reviews)
      .set({ approved, updatedAt: new Date() })
      .where(eq(reviews.id, parseInt(params.id)))
      .returning();

    if (!updatedReview.length) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Review ${approved ? 'approved' : 'rejected'} successfully`,
      review: updatedReview[0],
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reviews/[id] - Delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete the review
    const deletedReview = await db
      .delete(reviews)
      .where(eq(reviews.id, parseInt(params.id)))
      .returning();

    if (!deletedReview.length) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
