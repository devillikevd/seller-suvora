import { NextResponse } from "next/server";
import { signToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailOrPhone, password } = body;

    if (!emailOrPhone || !password) {
      return NextResponse.json(
        { error: "Email or mobile number and password are required." },
        { status: 400 }
      );
    }

    const trimmedIdentifier = emailOrPhone.trim();
    const lowerEmail = trimmedIdentifier.toLowerCase();

    // Query seller from Supabase PostgreSQL
    const seller = await prisma.seller.findFirst({
      where: {
        OR: [
          { email: lowerEmail },
          { phone: trimmedIdentifier },
          { phone: trimmedIdentifier.replace(/\s+/g, "") },
        ],
      },
      include: {
        stores: true,
      },
    });

    if (!seller) {
      return NextResponse.json(
        {
          error:
            "No merchant account found with this email or mobile number. Please register first.",
        },
        { status: 401 }
      );
    }

    // Verify hashed password
    const isMatch = await verifyPassword(password, seller.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Incorrect password. Please verify your credentials and try again." },
        { status: 401 }
      );
    }

    const store = seller.stores[0] || null;

    // Generate secure JWT token (7-day validity)
    const token = await signToken({
      sellerId: seller.id,
      email: seller.email,
      storeId: store?.id,
      role: seller.role,
    });

    // Set secure HTTP-only cookie
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: `Welcome back, ${seller.name}!`,
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        role: seller.role,
        isVerified: seller.isVerified,
      },
      store,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
