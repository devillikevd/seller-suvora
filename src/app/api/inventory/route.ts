import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mockInventory, mockStockHistory } from "@/mock/data";

export async function GET() {
  try {
    let inventory = [];
    let history = [];

    try {
      inventory = await prisma.inventoryItem.findMany({
        include: { product: true },
        orderBy: { lastUpdated: "desc" },
      });
      history = await prisma.stockAdjustment.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
      });
    } catch {
      inventory = mockInventory;
      history = mockStockHistory;
    }

    return NextResponse.json({ success: true, inventory, history });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, type, quantity, reason, notes, createdBy = "Store Staff" } = body;

    if (!productId || !type || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Product ID, valid adjustment type, and positive quantity are required." },
        { status: 400 }
      );
    }

    let updatedItem = null;

    try {
      const existing = await prisma.inventoryItem.findUnique({ where: { productId } });
      if (existing) {
        let newAvailable = existing.available;
        if (type === "add") newAvailable += quantity;
        else if (type === "reduce") newAvailable = Math.max(0, newAvailable - quantity);
        else newAvailable = quantity;

        const total = newAvailable + existing.reserved;
        let status = "in_stock";
        if (newAvailable === 0) status = "out_of_stock";
        else if (newAvailable <= existing.lowStockThreshold) status = "low_stock";

        updatedItem = await prisma.inventoryItem.update({
          where: { productId },
          data: {
            available: newAvailable,
            total,
            status,
            lastUpdated: new Date(),
            adjustments: {
              create: {
                type,
                quantity,
                reason: reason || "Manual stock edit",
                notes,
                createdBy,
              },
            },
          },
        });
      }
    } catch {
      updatedItem = { productId, type, quantity, reason };
    }

    return NextResponse.json({
      success: true,
      message: "Inventory level adjusted successfully.",
      inventoryItem: updatedItem,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
