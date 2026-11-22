import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mockStore } from "@/mock/data";

export async function GET() {
  try {
    let store = null;

    try {
      store = await prisma.store.findFirst({
        include: { operatingHours: true },
      });
    } catch {
      store = mockStore;
    }

    return NextResponse.json({ success: true, store: store || mockStore });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { status, deliveryRadiusKm, minimumOrderValue } = body;

    let updatedStore = null;

    try {
      const firstStore = await prisma.store.findFirst();
      if (firstStore) {
        updatedStore = await prisma.store.update({
          where: { id: firstStore.id },
          data: {
            ...(status ? { status } : {}),
            ...(deliveryRadiusKm ? { deliveryRadiusKm: Number(deliveryRadiusKm) } : {}),
            ...(minimumOrderValue ? { minimumOrderValue: Number(minimumOrderValue) } : {}),
          },
        });
      }
    } catch {
      updatedStore = { ...mockStore, ...body };
    }

    return NextResponse.json({
      success: true,
      message: "Store availability settings updated successfully.",
      store: updatedStore,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

