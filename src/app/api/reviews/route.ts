import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, products, user } from '@/db/schema';
import { eq, and, desc, asc, count } from 'drizzle-orm';
import { authClient } from '@/lib/auth-client';
import type { ExtendedSession } from '@/lib/auth-client';

// GET /api/reviews - Fetch reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const sortBy = searchParams.get('sortBy') || 'mostRecent';
    const filter = searchParams.get('filter') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Build where conditions
    let whereConditions = [eq(reviews.productId, parseInt(productId))];
    
    // Only show approved reviews
    whereConditions.push(eq(reviews.approved, true));

    // Apply rating filter if specified
    if (filter !== 'all') {
      const rating = parseInt(filter);
      if (!isNaN(rating) && rating >= 1 && rating <= 5) {
        whereConditions.push(eq(reviews.rating, rating));
      }
    }

    // Build order by
    let orderBy;
    switch (sortBy) {
      case 'mostHelpful':
        orderBy = [desc(reviews.helpful), desc(reviews.createdAt)];
        break;
      case 'highestRating':
        orderBy = [desc(reviews.rating), desc(reviews.createdAt)];
        break;
      case 'lowestRating':
        orderBy = [asc(reviews.rating), desc(reviews.createdAt)];
        break;
      default: // mostRecent
        orderBy = [desc(reviews.createdAt)];
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
      })
      .from(reviews)
      .leftJoin(user, eq(reviews.userId, user.id))
      .where(and(...whereConditions))
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    const reviewsData = result.map((row: any) => ({
      id: row.id.toString(),
      productId: row.productId.toString(),
      author: row.author || 'Anonymous',
      rating: row.rating,
      title: row.title,
      content: row.content,
      date: new Date(row.createdAt).toLocaleDateString(),
      verified: row.verified,
      helpful: row.helpful,
      size: row.size,
      color: row.color,
      images: row.images ? JSON.parse(row.images) : [],
    }));

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(eq(reviews.productId, parseInt(productId)), eq(reviews.approved, true)));

    const totalCount = Number(totalCountResult[0]?.count || 0);

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
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await authClient.getSession();
    if (!session?.data?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, rating, title, content, size, color, images } = body;

    // Validate required fields
    if (!productId || !rating || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, rating, title, content' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await db
      .select()
      .from(reviews)
      .where(and(
        eq(reviews.productId, parseInt(productId)),
        eq(reviews.userId, session.data.user.id)
      ))
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Create the review (unapproved by default)
    const newReview = await db
      .insert(reviews)
      .values({
        productId: parseInt(productId),
        userId: session.data.user.id,
        rating,
        title,
        content,
        verified: true, // Assume verified purchase for now
        approved: false, // Requires admin approval
        size: size || null,
        color: color || null,
        images: images ? JSON.stringify(images) : null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully. It will be visible once approved by an administrator.',
      review: newReview,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
