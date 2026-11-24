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
      return NextResponse.json({ success: true, count: 0, notifications: [] });
    }

    let notifications = await prisma.notification.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // If notifications table is empty, auto-seed starter operational notifications
    if (notifications.length === 0) {
      const defaults = [
        {
          title: "Storefront Activated on SUVORA",
          message: "Your quick-commerce storefront is configured and ready to accept neighbourhood grocery orders.",
          type: "platform",
          actionUrl: "/store",
        },
        {
          title: "Catalog Ready for Ordering",
          message: "Publish product barcodes, pack sizes, and prices in your catalog to increase order conversions.",
          type: "inventory",
          actionUrl: "/products/new",
        },
      ];

      for (const d of defaults) {
        await prisma.notification.create({
          data: {
            storeId,
            title: d.title,
            message: d.message,
            type: d.type,
            actionUrl: d.actionUrl,
            read: false,
          },
        });
      }

      notifications = await prisma.notification.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter((n) => !n.read).length,
      notifications,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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
    const { notificationId, markAll = false } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { storeId },
        data: { read: true },
      });
    } else if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true, message: "Notifications updated." });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
