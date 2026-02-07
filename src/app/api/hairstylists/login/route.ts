import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { hairstylists } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import {
  getHairstylistSessionToken,
  getHairstylistCookieName,
  getHairstylistCookieMaxAge,
} from "@/lib/hairstylist-session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const [hairstylist] = await db
      .select()
      .from(hairstylists)
      .where(eq(hairstylists.email, normalizedEmail))
      .limit(1);

    if (!hairstylist) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(String(password), hairstylist.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (hairstylist.status !== "approved") {
      if (hairstylist.status === "pending") {
        return NextResponse.json(
          { error: "Your account is pending approval. Please wait for admin approval." },
          { status: 403 }
        );
      }
      if (hairstylist.status === "rejected") {
        return NextResponse.json(
          { error: "Your account has been rejected. Please contact support." },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "Account not approved" },
        { status: 403 }
      );
    }

    const token = getHairstylistSessionToken({ id: hairstylist.id, email: hairstylist.email });
    const { password: _, ...rest } = hairstylist;

    const res = NextResponse.json({
      message: "Login successful",
      hairstylist: rest,
    });
    res.cookies.set(getHairstylistCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: getHairstylistCookieMaxAge(),
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("POST /api/hairstylists/login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
