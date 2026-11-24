import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.sellerId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, email } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Merchant name is required." }, { status: 400 });
    }

    const cleanEmail = email ? email.toLowerCase().trim() : undefined;
    const cleanPhone = phone ? phone.trim() : undefined;

    // Check email uniqueness if changed
    if (cleanEmail && cleanEmail !== session.email) {
      const existing = await prisma.seller.findUnique({ where: { email: cleanEmail } });
      if (existing && existing.id !== session.sellerId) {
        return NextResponse.json({ error: "This email address is already in use by another account." }, { status: 409 });
      }
    }

    // Check phone uniqueness if changed
    if (cleanPhone) {
      const existingPhone = await prisma.seller.findUnique({ where: { phone: cleanPhone } });
      if (existingPhone && existingPhone.id !== session.sellerId) {
        return NextResponse.json({ error: "This phone number is already registered." }, { status: 409 });
      }
    }

    const updatedSeller = await prisma.seller.update({
      where: { id: session.sellerId },
      data: {
        name: name.trim(),
        ...(cleanEmail ? { email: cleanEmail } : {}),
        ...(cleanPhone ? { phone: cleanPhone } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        isVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Merchant profile updated successfully.",
      seller: updatedSeller,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

