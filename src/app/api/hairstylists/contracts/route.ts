import { NextResponse } from "next/server";
import { db } from "@/db";
import { contracts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getHairstylistSessionFromCookie } from "@/lib/hairstylist-session";

export async function GET() {
  try {
    const session = await getHairstylistSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const results = await db
      .select({
        id: contracts.id,
        title: contracts.title,
        description: contracts.description,
        amount: contracts.amount,
        status: contracts.status,
        awardedAt: contracts.awardedAt,
        completedAt: contracts.completedAt,
        createdAt: contracts.createdAt,
        contractFileUrl: contracts.contractFileUrl,
      })
      .from(contracts)
      .where(eq(contracts.hairstylistId, session.id))
      .orderBy(desc(contracts.createdAt));

    const formatted = results.map((r) => ({
      ...r,
      awardedAt: r.awardedAt ? new Date(r.awardedAt).toISOString() : null,
      completedAt: r.completedAt ? new Date(r.completedAt).toISOString() : null,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/hairstylists/contracts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
