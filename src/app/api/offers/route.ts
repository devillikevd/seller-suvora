import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.sellerId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    let storeId = session.storeId;
    if (!storeId) {
      const store = await prisma.store.findFirst({ where: { sellerId: session.sellerId } });
      storeId = store?.id;
    }

    if (!storeId) {
      return NextResponse.json({ success: true, offers: [] });
    }

    const offers = await prisma.offer.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: offers.length, offers });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.sellerId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    let storeId = session.storeId;
    if (!storeId) {
      const store = await prisma.store.findFirst({ where: { sellerId: session.sellerId } });
      storeId = store?.id;
    }

    if (!storeId) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      code,
      discountType = "percentage",
      discountValue,
      minimumOrder = 0,
      maxUsage = 100,
      startDate,
      endDate,
    } = body;

    if (!title?.trim() || !code?.trim() || discountValue === undefined) {
      return NextResponse.json(
        { error: "Coupon title, promo code, and discount value are required." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Check code uniqueness in store
    const existing = await prisma.offer.findFirst({
      where: { storeId, code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Coupon code "${cleanCode}" already exists in your store offers.` },
        { status: 409 }
      );
    }

    const offer = await prisma.offer.create({
      data: {
        storeId,
        title: title.trim(),
        description: description?.trim() || null,
        code: cleanCode,
        discountType: discountType === "fixed" ? "fixed" : "percentage",
        discountValue: Number(discountValue),
        minimumOrder: Number(minimumOrder || 0),
        maxUsage: Number(maxUsage || 100),
        usedCount: 0,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: "active",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Coupon "${cleanCode}" created successfully!`,
      offer,
    }, { status: 201 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
