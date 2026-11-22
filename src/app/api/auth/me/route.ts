import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.sellerId) {
      return NextResponse.json({ authenticated: false, seller: null, store: null }, { status: 401 });
    }

    const seller = await prisma.seller.findUnique({
      where: { id: session.sellerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
      },
    });

    if (!seller) {
      return NextResponse.json({ authenticated: false, seller: null, store: null }, { status: 401 });
    }

    let store = null;
    if (session.storeId) {
      store = await prisma.store.findUnique({ where: { id: session.storeId } });
    } else {
      const stores = await prisma.store.findMany({ where: { sellerId: seller.id }, take: 1 });
      store = stores[0] || null;
    }

    return NextResponse.json({
      authenticated: true,
      seller,
      store,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
