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
      return NextResponse.json({ success: true, count: 0, customers: [] });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";

    // Query customers who have ordered from this store
    const storeOrders = await prisma.order.findMany({
      where: { storeId },
      select: {
        customerId: true,
        total: true,
        createdAt: true,
        customer: true,
      },
    });

    // Group by customer
    const customerMap = new Map<string, {
      id: string;
      name: string;
      phone: string;
      email?: string | null;
      address?: string | null;
      totalOrders: number;
      totalSpent: number;
      lastOrderDate: string;
      joinedAt: string;
    }>();

    for (const order of storeOrders) {
      if (!order.customer) continue;
      const c = order.customer;
      const existing = customerMap.get(c.id);

      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += order.total;
        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.createdAt.toISOString();
        }
      } else {
        customerMap.set(c.id, {
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          address: c.address,
          totalOrders: 1,
          totalSpent: order.total,
          lastOrderDate: order.createdAt.toISOString(),
          joinedAt: c.joinedAt.toISOString(),
        });
      }
    }

    let customers = Array.from(customerMap.values());

    if (search) {
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.phone.includes(search) ||
          (c.email && c.email.toLowerCase().includes(search))
      );
    }

    // Sort by latest order date
    customers.sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());

    return NextResponse.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

