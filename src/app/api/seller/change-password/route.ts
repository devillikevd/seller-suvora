import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, verifyPassword, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.sellerId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Find seller and verify password
    const seller = await prisma.seller.findUnique({
      where: { id: session.sellerId },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller account not found." }, { status: 404 });
    }

    const isValid = await verifyPassword(currentPassword, seller.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password does not match. Please verify your old password." },
        { status: 400 }
      );
    }

    // Hash new password and save
    const newPasswordHash = await hashPassword(newPassword);
    await prisma.seller.update({
      where: { id: seller.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully! Please use your new password next time.",
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
