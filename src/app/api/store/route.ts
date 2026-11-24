import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.sellerId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    // Find store belonging to authenticated seller
    const store = await prisma.store.findFirst({
      where: session.storeId ? { id: session.storeId, sellerId: session.sellerId } : { sellerId: session.sellerId },
      include: {
        operatingHours: {
          orderBy: { day: "asc" },
        },
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found for this merchant." }, { status: 404 });
    }

    return NextResponse.json({ success: true, store });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.sellerId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      email,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      landmark,
      deliveryRadiusKm,
      minimumOrderValue,
      deliveryFee,
      freeDeliveryAbove,
      deliveryEnabled,
      pickupEnabled,
      status,
      gstNumber,
      panNumber,
      fssaiNumber,
      operatingHours,
    } = body;

    // Verify store ownership
    const existingStore = await prisma.store.findFirst({
      where: session.storeId ? { id: session.storeId, sellerId: session.sellerId } : { sellerId: session.sellerId },
    });

    if (!existingStore) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    // Update store details
    const updatedStore = await prisma.$transaction(async (tx) => {
      const storeUpdate = await tx.store.update({
        where: { id: existingStore.id },
        data: {
          ...(name ? { name: name.trim() } : {}),
          ...(description !== undefined ? { description: description?.trim() || null } : {}),
          ...(email ? { email: email.toLowerCase().trim() } : {}),
          ...(phone ? { phone: phone.trim() } : {}),
          ...(addressLine1 ? { addressLine1: addressLine1.trim() } : {}),
          ...(addressLine2 !== undefined ? { addressLine2: addressLine2?.trim() || null } : {}),
          ...(city ? { city: city.trim() } : {}),
          ...(state ? { state: state.trim() } : {}),
          ...(pincode ? { pincode: pincode.trim() } : {}),
          ...(landmark !== undefined ? { landmark: landmark?.trim() || null } : {}),
          ...(deliveryRadiusKm !== undefined ? { deliveryRadiusKm: Number(deliveryRadiusKm) } : {}),
          ...(minimumOrderValue !== undefined ? { minimumOrderValue: Number(minimumOrderValue) } : {}),
          ...(deliveryFee !== undefined ? { deliveryFee: Number(deliveryFee) } : {}),
          ...(freeDeliveryAbove !== undefined ? { freeDeliveryAbove: Number(freeDeliveryAbove) } : {}),
          ...(deliveryEnabled !== undefined ? { deliveryEnabled: Boolean(deliveryEnabled) } : {}),
          ...(pickupEnabled !== undefined ? { pickupEnabled: Boolean(pickupEnabled) } : {}),
          ...(status ? { status } : {}),
          ...(gstNumber !== undefined ? { gstNumber: gstNumber?.trim() || null } : {}),
          ...(panNumber !== undefined ? { panNumber: panNumber?.trim() || null } : {}),
          ...(fssaiNumber !== undefined ? { fssaiNumber: fssaiNumber?.trim() || null } : {}),
        },
      });

      // Update operating hours if provided
      if (Array.isArray(operatingHours) && operatingHours.length > 0) {
        for (const item of operatingHours) {
          if (item.day) {
            await tx.operatingHour.upsert({
              where: {
                storeId_day: {
                  storeId: existingStore.id,
                  day: item.day,
                },
              },
              create: {
                storeId: existingStore.id,
                day: item.day,
                isOpen: item.isOpen ?? true,
                openTime: item.open || item.openTime || "07:00",
                closeTime: item.close || item.closeTime || "22:30",
              },
              update: {
                isOpen: item.isOpen ?? true,
                openTime: item.open || item.openTime || "07:00",
                closeTime: item.close || item.closeTime || "22:30",
              },
            });
          }
        }
      }

      return storeUpdate;
    });

    const refreshedStore = await prisma.store.findUnique({
      where: { id: updatedStore.id },
      include: { operatingHours: true },
    });

    return NextResponse.json({
      success: true,
      message: "Store configuration updated successfully in database.",
      store: refreshedStore,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}
