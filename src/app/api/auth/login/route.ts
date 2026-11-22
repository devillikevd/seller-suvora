import { NextResponse } from "next/server";
import { signToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { mockSeller, mockStore } from "@/mock/data";

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

    // Try finding seller in database if DB is connected
    let seller = null;
    let store = null;

    try {
      seller = await prisma.seller.findFirst({
        where: {
          OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
        },
        include: {
          stores: true,
        },
      });

      if (seller) {
        const isMatch = await verifyPassword(password, seller.passwordHash);
        if (!isMatch) {
          return NextResponse.json(
            { error: "Invalid credentials. Please verify your password." },
            { status: 401 }
          );
        }
        store = seller.stores[0] || null;
      }
    } catch {
      // If DB is offline/unmigrated in dev mode, fallback to verified mock owner credentials
      console.warn("Database connection unavailable, falling back to mock authentication.");
    }

    // Fallback to demo credentials if not yet migrated in database
    if (!seller) {
      if (
        (emailOrPhone === "rajesh@freshmart.in" || emailOrPhone === "+91 98765 43210") &&
        password === "password123"
      ) {
        seller = {
          id: mockSeller.id,
          name: mockSeller.name,
          email: mockSeller.email,
          phone: mockSeller.phone,
          role: mockSeller.role,
        };
        store = mockStore;
      } else {
        return NextResponse.json(
          { error: "Invalid credentials. Use rajesh@freshmart.in / password123 for demo." },
          { status: 401 }
        );
      }
    }

    // Generate secure JWT token
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
      message: "Authentication successful.",
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        role: seller.role,
      },
      store,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

