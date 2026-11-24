import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.sellerId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.offer.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Offer not found." }, { status: 404 });
    }

    if (existing.store.sellerId !== session.sellerId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const updated = await prisma.offer.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Offer status updated to ${updated.status}.`,
      offer: updated,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.sellerId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.offer.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Offer not found." }, { status: 404 });
    }

    if (existing.store.sellerId !== session.sellerId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    await prisma.offer.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Offer deleted permanently from store database.",
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
