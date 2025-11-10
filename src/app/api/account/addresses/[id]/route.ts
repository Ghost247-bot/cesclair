import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { shippingAddresses } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// UPDATE address
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const addressId = parseInt(params.id);
    if (isNaN(addressId)) {
      return NextResponse.json(
        { error: "Invalid address ID" },
        { status: 400 }
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
      country,
      phone,
      isDefault,
    } = body;

    // Verify address belongs to user
    const existingAddress = await db
      .select()
      .from(shippingAddresses)
      .where(
        and(
          eq(shippingAddresses.id, addressId),
          eq(shippingAddresses.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingAddress.length === 0) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault === true) {
      await db
        .update(shippingAddresses)
        .set({ isDefault: false })
        .where(eq(shippingAddresses.userId, session.user.id));
    }

    // Update address
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (addressLine1 !== undefined) updateData.addressLine1 = addressLine1.trim();
    if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2?.trim() || null;
    if (city !== undefined) updateData.city = city.trim();
    if (state !== undefined) updateData.state = state.trim();
    if (zipCode !== undefined) updateData.zipCode = zipCode.trim();
    if (country !== undefined) updateData.country = country.trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const [updatedAddress] = await db
      .update(shippingAddresses)
      .set(updateData)
      .where(
        and(
          eq(shippingAddresses.id, addressId),
          eq(shippingAddresses.userId, session.user.id)
        )
      )
      .returning();

    return NextResponse.json({
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const addressId = parseInt(params.id);
    if (isNaN(addressId)) {
      return NextResponse.json(
        { error: "Invalid address ID" },
        { status: 400 }
      );
    }

    // Verify address belongs to user
    const existingAddress = await db
      .select()
      .from(shippingAddresses)
      .where(
        and(
          eq(shippingAddresses.id, addressId),
          eq(shippingAddresses.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingAddress.length === 0) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    // Delete address
    await db
      .delete(shippingAddresses)
      .where(
        and(
          eq(shippingAddresses.id, addressId),
          eq(shippingAddresses.userId, session.user.id)
        )
      );

    return NextResponse.json({
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

