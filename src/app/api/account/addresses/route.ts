import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { shippingAddresses } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET all addresses for user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const addresses = await db
      .select()
      .from(shippingAddresses)
      .where(eq(shippingAddresses.userId, session.user.id))
      .orderBy(shippingAddresses.isDefault, shippingAddresses.createdAt);

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// CREATE new address
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country = "United States",
      phone,
      isDefault = false,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !addressLine1 || !city || !state || !zipCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await db
        .update(shippingAddresses)
        .set({ isDefault: false })
        .where(eq(shippingAddresses.userId, session.user.id));
    }

    // Create new address
    const [newAddress] = await db
      .insert(shippingAddresses)
      .values({
        userId: session.user.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2?.trim() || null,
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        country: country.trim(),
        phone: phone?.trim() || null,
        isDefault,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Address created successfully",
        address: newAddress,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

