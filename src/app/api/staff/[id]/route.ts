import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
    const existing = await prisma.staffMember.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Staff member not found." }, { status: 404 });
    }

    if (existing.store.sellerId !== session.sellerId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    await prisma.staffMember.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Staff member access revoked permanently.",
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

