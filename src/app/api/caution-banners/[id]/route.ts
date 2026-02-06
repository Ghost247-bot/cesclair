import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cautionBanners } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

// GET - Fetch a specific caution banner by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bannerId = parseInt(id, 10);
    if (isNaN(bannerId)) {
      return NextResponse.json({ error: "Invalid banner ID" }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [banner] = await db
      .select()
      .from(cautionBanners)
      .where(eq(cautionBanners.id, bannerId));

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error fetching caution banner:", error);
    return NextResponse.json(
      { error: "Failed to fetch caution banner" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing caution banner (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bannerId = parseInt(id, 10);
    if (isNaN(bannerId)) {
      return NextResponse.json({ error: "Invalid banner ID" }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { message, type, targetRole, targetUserId, active } = body;

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (message !== undefined) updateData.message = message.trim();
    if (type !== undefined) updateData.type = type;
    if (targetRole !== undefined) updateData.targetRole = targetRole;
    if (targetUserId !== undefined) updateData.targetUserId = targetUserId || null;
    if (active !== undefined) updateData.active = active;

    // If targeting a specific user, set targetRole to 'specific'
    if (targetUserId) {
      updateData.targetRole = "specific";
    }

    const [updated] = await db
      .update(cautionBanners)
      .set(updateData)
      .where(eq(cautionBanners.id, bannerId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating caution banner:", error);
    return NextResponse.json(
      { error: "Failed to update caution banner" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a caution banner (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bannerId = parseInt(id, 10);
    if (isNaN(bannerId)) {
      return NextResponse.json({ error: "Invalid banner ID" }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [deleted] = await db
      .delete(cautionBanners)
      .where(eq(cautionBanners.id, bannerId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting caution banner:", error);
    return NextResponse.json(
      { error: "Failed to delete caution banner" },
      { status: 500 }
    );
  }
}
