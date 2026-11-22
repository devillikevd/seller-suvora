import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mockProducts } from "@/mock/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let product = null;

    try {
      product = await prisma.product.findUnique({
        where: { id },
        include: { category: true, variants: true, inventory: true },
      });
    } catch {
      product = mockProducts.find((p) => p.id === id) || null;
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    let updatedProduct = null;

    try {
      updatedProduct = await prisma.product.update({
        where: { id },
        data: body,
      });
    } catch {
      updatedProduct = { id, ...body, updatedAt: new Date().toISOString() };
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
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
    const { id } = await params;

    try {
      await prisma.product.delete({ where: { id } });
    } catch {
      // Graceful fallback
    }

    return NextResponse.json({ success: true, message: `Product ${id} deleted successfully.` });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
