import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cautionBanners, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, or, desc } from "drizzle-orm";

// GET - Fetch caution banners for current user (or all for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    // If admin, return all banners
    if (session?.user && (session.user as any).role === "admin") {
      const banners = await db
        .select({
          id: cautionBanners.id,
          message: cautionBanners.message,
          type: cautionBanners.type,
          targetRole: cautionBanners.targetRole,
          targetUserId: cautionBanners.targetUserId,
          active: cautionBanners.active,
          createdBy: cautionBanners.createdBy,
          createdAt: cautionBanners.createdAt,
          updatedAt: cautionBanners.updatedAt,
        })
        .from(cautionBanners)
        .orderBy(desc(cautionBanners.createdAt));

      return NextResponse.json(banners);
    }

    // For regular users, return only active banners that target them
    if (!session?.user) {
      return NextResponse.json([]);
    }

    const userRole = (session.user as any).role || "member";
    const userId = session.user.id;

    const banners = await db
      .select()
      .from(cautionBanners)
      .where(
        and(
          eq(cautionBanners.active, true),
          or(
            eq(cautionBanners.targetRole, "all"),
            eq(cautionBanners.targetRole, userRole),
            eq(cautionBanners.targetUserId, userId)
          )
        )
      )
      .orderBy(desc(cautionBanners.createdAt));

    return NextResponse.json(banners);
  } catch (error) {
    console.error("Error fetching caution banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch caution banners" },
      { status: 500 }
    );
  }
}

// POST - Create a new caution banner (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { message, type, targetRole, targetUserId } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const [banner] = await db
      .insert(cautionBanners)
      .values({
        message: message.trim(),
        type: type || "warning",
        targetRole: targetUserId ? "specific" : (targetRole || "all"),
        targetUserId: targetUserId || null,
        active: true,
        createdBy: session.user.id,
      })
      .returning();

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error("Error creating caution banner:", error);
    return NextResponse.json(
      { error: "Failed to create caution banner" },
      { status: 500 }
    );
  }
}
