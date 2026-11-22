import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mockOrders } from "@/mock/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase() || "";

    let orders = [];

    try {
      orders = await prisma.order.findMany({
        where: {
          ...(status && status !== "all" ? { status } : {}),
          ...(search
            ? {
                OR: [
                  { orderNumber: { contains: search, mode: "insensitive" } },
                  { customer: { name: { contains: search, mode: "insensitive" } } },
                ],
              }
            : {}),
        },
        include: {
          customer: true,
          items: true,
          timeline: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      orders = mockOrders.filter((o) => {
        const matchesStatus = !status || status === "all" || o.status === status;
        const matchesSearch =
          !search ||
          o.orderNumber.toLowerCase().includes(search) ||
          o.customer.name.toLowerCase().includes(search) ||
          o.customer.phone.includes(search);
        return matchesStatus && matchesSearch;
      });
    }

    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, items, deliveryFee = 29, paymentMethod = "upi" } = body;

    if (!customerPhone || !items || !items.length) {
      return NextResponse.json(
        { error: "Customer details and order items are required." },
        { status: 400 }
      );
    }

    const subtotal = items.reduce(
      (sum: number, it: { price: number; quantity: number }) => sum + it.price * it.quantity,
      0
    );
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + deliveryFee + tax;
    const orderNumber = `SUV-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      status: "new",
      subtotal,
      deliveryFee,
      tax,
      total,
      paymentMethod,
      paymentStatus: "paid",
      customer: {
        name: customerName || "Quick Commerce Shopper",
        phone: customerPhone,
      },
      items,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, message: "Order placed successfully.", order: newOrder },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

