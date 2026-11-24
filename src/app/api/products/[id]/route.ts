import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.sellerId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true, inventory: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
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
    const session = await getSession();
    if (!session || !session.sellerId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Verify merchant ownership
    if (existing.store.sellerId !== session.sellerId) {
      return NextResponse.json({ error: "Forbidden. You do not own this product." }, { status: 403 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.price !== undefined ? { price: Number(body.price) } : {}),
        ...(body.mrp !== undefined ? { mrp: Number(body.mrp) } : {}),
        ...(body.stock !== undefined ? { stock: Number(body.stock) } : {}),
        ...(body.lowStockThreshold !== undefined ? { lowStockThreshold: Number(body.lowStockThreshold) } : {}),
        ...(body.images ? { images: body.images } : {}),
      },
      include: { category: true, variants: true, inventory: true },
    });

    // Also update inventory item if stock changed
    if (body.stock !== undefined) {
      await prisma.inventoryItem.updateMany({
        where: { productId: id },
        data: {
          available: Number(body.stock),
          total: Number(body.stock),
          status: Number(body.stock) === 0 ? "out_of_stock" : Number(body.stock) <= 10 ? "low_stock" : "in_stock",
          lastUpdated: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      product: updated,
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
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (existing.store.sellerId !== session.sellerId) {
      return NextResponse.json({ error: "Forbidden. You do not own this product." }, { status: 403 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Product deleted permanently from database.",
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
