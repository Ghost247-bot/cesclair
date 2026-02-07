import { NextResponse } from "next/server";
import { db } from "@/db";
import { hairstylists } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getHairstylistSessionFromCookie } from "@/lib/hairstylist-session";

export async function GET() {
  try {
    const session = await getHairstylistSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const [hairstylist] = await db
      .select({
        id: hairstylists.id,
        name: hairstylists.name,
        email: hairstylists.email,
        bio: hairstylists.bio,
        portfolioUrl: hairstylists.portfolioUrl,
        specialties: hairstylists.specialties,
        status: hairstylists.status,
        avatarUrl: hairstylists.avatarUrl,
        bannerUrl: hairstylists.bannerUrl,
        bannerTitle: hairstylists.bannerTitle,
        bannerDescription: hairstylists.bannerDescription,
        bannerActive: hairstylists.bannerActive,
        createdAt: hairstylists.createdAt,
        updatedAt: hairstylists.updatedAt,
      })
      .from(hairstylists)
      .where(eq(hairstylists.id, session.id))
      .limit(1);

    if (!hairstylist) {
      return NextResponse.json({ error: "Hairstylist not found" }, { status: 404 });
    }

    return NextResponse.json(hairstylist);
  } catch (error) {
    console.error("GET /api/hairstylists/me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
