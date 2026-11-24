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
      return NextResponse.json({ success: true, staff: [] });
    }

    const staff = await prisma.staffMember.findMany({
      where: { storeId },
      orderBy: { invitedAt: "desc" },
    });

    return NextResponse.json({ success: true, count: staff.length, staff });
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
    const { name, email, phone, role = "store_manager", permissions = [] } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Staff member name and email are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.staffMember.findFirst({
      where: { storeId, email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A staff member with this email already belongs to your store." },
        { status: 409 }
      );
    }

    const staffMember = await prisma.staffMember.create({
      data: {
        storeId,
        name: name.trim(),
        email: cleanEmail,
        phone: phone?.trim() || "+91 9000000000",
        role,
        status: "active",
        permissions: permissions || [
          { module: "orders", actions: ["view", "edit"] },
          { module: "inventory", actions: ["view", "edit"] },
        ],
        joinedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Staff member ${staffMember.name} added to store team successfully!`,
      staffMember,
    }, { status: 201 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

