import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mockOrders } from "@/mock/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let order = null;

    try {
      order = await prisma.order.findUnique({
        where: { id },
        include: { customer: true, items: true, timeline: true },
      });
    } catch {
      order = mockOrders.find((o) => o.id === id) || null;
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, note, cancellationReason } = body;

    if (!status) {
      return NextResponse.json({ error: "Order status is required." }, { status: 400 });
    }

    let updatedOrder = null;

    try {
      updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          status,
          ...(cancellationReason ? { cancellationReason } : {}),
          timeline: {
            create: {
              status,
              note: note || undefined,
            },
          },
        },
        include: { customer: true, items: true, timeline: true },
      });
    } catch {
      updatedOrder = {
        id,
        status,
        cancellationReason,
        updatedAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      message: `Order status transitioned to ${status.toUpperCase()}.`,
      order: updatedOrder,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
