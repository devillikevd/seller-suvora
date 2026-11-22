import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { mockSeller, mockStore } from "@/mock/data";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ authenticated: false, seller: null }, { status: 401 });
    }

    let seller = null;
    let store = null;

    try {
      seller = await prisma.seller.findUnique({
        where: { id: session.sellerId },
        select: { id: true, name: true, email: true, phone: true, role: true, isVerified: true },
      });
      if (session.storeId) {
        store = await prisma.store.findUnique({ where: { id: session.storeId } });
      }
    } catch {
      // Fallback in case DB is unmigrated in dev mode
    }

    if (!seller) {
      seller = mockSeller;
      store = mockStore;
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
