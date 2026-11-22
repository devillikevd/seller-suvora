import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, password, storeName } = body;

    // 1. Validation
    if (!fullName || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Full name, email, phone number, and password are required." },
        { status: 400 }
      );
    }

    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { error: "Please provide a valid business email address." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email.toLowerCase().trim();

    // 2. Check if email or phone already exists in Supabase
    const existing = await prisma.seller.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { phone: cleanPhone }],
      },
    });

    if (existing) {
      const isEmail = existing.email === cleanEmail;
      return NextResponse.json(
        {
          error: isEmail
            ? "A merchant account with this email already exists. Please sign in."
            : "A merchant account with this phone number already exists. Please sign in.",
        },
        { status: 409 }
      );
    }

    // 3. Hash password securely with bcrypt
    const passwordHash = await hashPassword(password);

    // 4. Generate store name & unique slug
    const resolvedStoreName = (storeName || `${fullName.trim()}'s Store`).trim();
    const baseSlug = resolvedStoreName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 24);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

    // 5. Atomic transaction to create Seller, Store, and Default Operating Hours
    const result = await prisma.$transaction(async (tx) => {
      // Create Seller
      const newSeller = await tx.seller.create({
        data: {
          name: fullName.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          passwordHash,
          role: "owner",
          isVerified: true,
        },
      });

      // Create Store
      const newStore = await tx.store.create({
        data: {
          sellerId: newSeller.id,
          name: resolvedStoreName,
          slug: uniqueSlug,
          email: cleanEmail,
          phone: cleanPhone,
          status: "online",
          verificationStatus: "approved",
          addressLine1: "Store location setup in progress",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560001",
          deliveryRadiusKm: 5.0,
          minimumOrderValue: 199.0,
          deliveryFee: 29.0,
          freeDeliveryAbove: 499.0,
        },
      });

      // Create Operating Hours for all 7 days
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      await Promise.all(
        days.map((day) =>
          tx.operatingHour.create({
            data: {
              storeId: newStore.id,
              day,
              isOpen: true,
              openTime: "07:00",
              closeTime: "22:30",
            },
          })
        )
      );

      // Create 2 default categories for the new store
      await tx.category.createMany({
        data: [
          {
            storeId: newStore.id,
            name: "Grocery & Daily Essentials",
            description: "Daily retail grocery staples",
            status: "active",
          },
          {
            storeId: newStore.id,
            name: "Packaged Foods & Beverages",
            description: "Instant snacks, chips and juices",
            status: "active",
          },
        ],
      });

      return { seller: newSeller, store: newStore };
    });

    // 6. Sign JWT Session Token
    const token = await signToken({
      sellerId: result.seller.id,
      email: result.seller.email,
      storeId: result.store.id,
      role: result.seller.role,
    });

    // 7. Set secure HTTP-only cookie
    await setSessionCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: "Seller registered successfully! Welcome to SUVORA.",
        seller: {
          id: result.seller.id,
          name: result.seller.name,
          email: result.seller.email,
          phone: result.seller.phone,
          role: result.seller.role,
        },
        store: result.store,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
