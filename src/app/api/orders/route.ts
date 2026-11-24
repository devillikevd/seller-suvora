import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
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
      return NextResponse.json({ success: true, count: 0, orders: [] });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase().trim() || "";

    const orders = await prisma.order.findMany({
      where: {
        storeId,
        ...(status && status !== "all" ? { status } : {}),
        ...(search
          ? {
              OR: [
                { orderNumber: { contains: search, mode: "insensitive" } },
                { customer: { name: { contains: search, mode: "insensitive" } } },
                { customer: { phone: { contains: search } } },
              ],
            }
          : {}),
      },
      include: {
        customer: true,
        items: true,
        timeline: {
          orderBy: { timestamp: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: orders.length, orders });
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
      return NextResponse.json({ error: "Store not found for this merchant." }, { status: 404 });
    }

    const body = await request.json();
    const {
      customerName = "Quick Shopper",
      customerPhone,
      items = [],
      deliveryFee = 29.0,
      paymentMethod = "upi",
    } = body;

    if (!customerPhone || !items.length) {
      return NextResponse.json(
        { error: "Customer phone number and at least 1 order item are required." },
        { status: 400 }
      );
    }

    const cleanPhone = customerPhone.trim();

    // Find or create Customer
    let customer = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName.trim(),
          phone: cleanPhone,
          totalOrders: 1,
        },
      });
    } else {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { totalOrders: { increment: 1 } },
      });
    }

    const subtotal = items.reduce(
      (sum: number, it: { price: number; quantity: number }) => sum + it.price * it.quantity,
      0
    );
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + Number(deliveryFee) + tax;
    const orderNumber = `SUV-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          storeId,
          customerId: customer.id,
          orderNumber,
          status: "new",
          subtotal,
          deliveryFee: Number(deliveryFee),
          tax,
          total,
          paymentMethod,
          paymentStatus: "paid",
          dispatchSlaMinutes: 15,
        },
      });

      // Create Order Items
      for (const it of items) {
        let productId = it.productId;
        // If productId is not provided or not in DB, link to first product or dummy
        if (!productId) {
          const firstProd = await tx.product.findFirst({ where: { storeId } });
          productId = firstProd?.id;
        }

        if (productId) {
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId,
              productName: it.productName || it.name || "Item",
              quantity: Number(it.quantity || 1),
              price: Number(it.price || 0),
              total: Number(it.price || 0) * Number(it.quantity || 1),
            },
          });
        }
      }

      // Create Timeline initial event
      await tx.orderTimeline.create({
        data: {
          orderId: newOrder.id,
          status: "new",
          note: "Order received via SUVORA Consumer App",
        },
      });

      return newOrder;
    });

    const refreshed = await prisma.order.findUnique({
      where: { id: order.id },
      include: { customer: true, items: true, timeline: true },
    });

    return NextResponse.json({
      success: true,
      message: "Order registered successfully in live database.",
      order: refreshed,
    }, { status: 201 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
