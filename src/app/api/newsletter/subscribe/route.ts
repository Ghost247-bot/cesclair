import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { newsletterSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { 
          error: 'Email is required',
          code: 'MISSING_EMAIL'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();
    
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { 
          error: 'Invalid email format',
          code: 'INVALID_EMAIL'
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscription = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, normalizedEmail))
      .limit(1);

    if (existingSubscription.length > 0) {
      const subscription = existingSubscription[0];
      
      // If already subscribed and active, return success
      if (subscription.isActive) {
        return NextResponse.json(
          { 
            message: 'You are already subscribed to our newsletter!',
            code: 'ALREADY_SUBSCRIBED',
            discountCode: subscription.discountCode && !subscription.discountUsed 
              ? subscription.discountCode 
              : null
          },
          { status: 200 }
        );
      }

      // If previously unsubscribed, reactivate in database
      const [updatedSubscription] = await db
        .update(newsletterSubscriptions)
        .set({ 
          isActive: true,
          subscribedAt: new Date()
        })
        .where(eq(newsletterSubscriptions.email, normalizedEmail))
        .returning();

      if (updatedSubscription) {
        console.log('Newsletter subscription reactivated in database:', {
          id: updatedSubscription.id,
          email: updatedSubscription.email,
          isActive: updatedSubscription.isActive
        });
      }

      return NextResponse.json(
        { 
          message: 'Welcome back! You have been resubscribed to our newsletter.',
          code: 'RESUBSCRIBED',
          discountCode: subscription.discountCode && !subscription.discountUsed 
            ? subscription.discountCode 
            : null
        },
        { status: 200 }
      );
    }

    // Generate discount code (20% off)
    const discountCode = `WELCOME20${nanoid(6).toUpperCase()}`;

    // Create new subscription in database
    const [newSubscription] = await db
      .insert(newsletterSubscriptions)
      .values({
        email: normalizedEmail,
        discountCode,
        isActive: true,
        subscribedAt: new Date(),
      })
      .returning();

    // Verify the subscription was created
    if (!newSubscription) {
      console.error('Failed to create newsletter subscription in database');
      return NextResponse.json(
        { 
          error: 'Failed to save subscription. Please try again later.',
          code: 'DATABASE_ERROR'
        },
        { status: 500 }
      );
    }

    console.log('Newsletter subscription saved to database:', {
      id: newSubscription.id,
      email: newSubscription.email,
      discountCode: newSubscription.discountCode,
      subscribedAt: newSubscription.subscribedAt
    });

    return NextResponse.json(
      { 
        message: 'Successfully subscribed! Check your email for your 20% off discount code.',
        code: 'SUBSCRIPTION_SUCCESS',
        discountCode,
        subscriptionId: newSubscription.id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to subscribe. Please try again later.',
        code: 'SUBSCRIPTION_ERROR'
      },
      { status: 500 }
    );
  }
}

