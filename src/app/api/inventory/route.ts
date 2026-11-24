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
      return NextResponse.json({ success: true, inventory: [], history: [] });
    }

    const inventory = await prisma.inventoryItem.findMany({
      where: { storeId },
      include: { product: true },
      orderBy: { lastUpdated: "desc" },
    });

    const history = await prisma.stockAdjustment.findMany({
      where: {
        inventoryItem: { storeId },
      },
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        inventoryItem: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json({ success: true, count: inventory.length, inventory, history });
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

    const body = await request.json();
    const { productId, type, quantity, reason, notes, createdBy = "Store Staff" } = body;

    if (!productId || !type || quantity === undefined || quantity < 0) {
      return NextResponse.json(
        { error: "Product ID, valid adjustment type, and quantity are required." },
        { status: 400 }
      );
    }

    const existing = await prisma.inventoryItem.findUnique({
      where: { productId },
      include: { store: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Inventory item not found." }, { status: 404 });
    }

    if (existing.store.sellerId !== session.sellerId) {
      return NextResponse.json({ error: "Forbidden. You do not own this inventory." }, { status: 403 });
    }

    let newAvailable = existing.available;
    const qtyNum = Number(quantity);

    if (type === "add") newAvailable += qtyNum;
    else if (type === "reduce") newAvailable = Math.max(0, newAvailable - qtyNum);
    else newAvailable = qtyNum;

    const total = newAvailable + existing.reserved;
    let status = "in_stock";
    if (newAvailable === 0) status = "out_of_stock";
    else if (newAvailable <= existing.lowStockThreshold) status = "low_stock";

    // Update inventory item and product stock
    const updatedItem = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { stock: newAvailable },
      });

      return tx.inventoryItem.update({
        where: { productId },
        data: {
          available: newAvailable,
          total,
          status,
          lastUpdated: new Date(),
          adjustments: {
            create: {
              type,
              quantity: qtyNum,
              reason: reason || "Manual stock edit",
              notes,
              createdBy,
            },
          },
        },
        include: { product: true },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Inventory stock adjusted successfully.",
      inventoryItem: updatedItem,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
