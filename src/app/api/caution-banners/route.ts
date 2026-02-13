import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cautionBanners, user, designers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getHairstylistSessionFromRequest } from "@/lib/hairstylist-session";
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

    // Resolve effective role and user id for banner targeting
    let effectiveRole: string | null = null;
    let effectiveUserId: string | null = null;

    if (session?.user) {
      effectiveRole = (session.user as any).role || "member";
      effectiveUserId = session.user.id;
      // If user is an approved designer (by email), they should see designer-targeted banners
      const email = session.user.email?.trim()?.toLowerCase();
      if (email) {
        const designerRow = await db
          .select({ id: designers.id, status: designers.status })
          .from(designers)
          .where(eq(designers.email, email))
          .limit(1);
        if (designerRow.length > 0 && designerRow[0].status === "approved") {
          effectiveRole = "designer";
        }
      }
    } else {
      // No Better Auth session — check hairstylist session (hairstylist dashboard)
      const hairstylistSession = getHairstylistSessionFromRequest(request);
      if (hairstylistSession) {
        effectiveRole = "hairstylist";
        effectiveUserId = null;
      }
    }

    // When we have an identity, return matching banners; otherwise return only "all" so everyone sees site-wide banners
    const banners = await db
      .select()
      .from(cautionBanners)
      .where(
        and(
          eq(cautionBanners.active, true),
          effectiveRole !== null
            ? or(
                eq(cautionBanners.targetRole, "all"),
                eq(cautionBanners.targetRole, effectiveRole),
                ...(effectiveUserId ? [eq(cautionBanners.targetUserId, effectiveUserId)] : [])
              )
            : eq(cautionBanners.targetRole, "all")
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
