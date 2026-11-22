import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signToken, setSessionCookie } from "@/lib/auth";
import { verifyPendingOtp, clearPendingVerification } from "@/lib/otp-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email address and 6-digit OTP code are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // 1. Verify OTP from pending registration store
    const pending = verifyPendingOtp(cleanEmail, cleanOtp);

    if (!pending) {
      return NextResponse.json(
        { error: "Invalid or expired OTP code. Please enter the correct code or request a new one." },
        { status: 400 }
      );
    }

    // 2. Generate store name & unique slug
    const resolvedStoreName = (pending.storeName || `${pending.fullName.trim()}'s Store`).trim();
    const baseSlug = resolvedStoreName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 24);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

    // 3. Atomic transaction to create Seller and Store in Supabase PostgreSQL
    const result = await prisma.$transaction(async (tx) => {
      // Create Verified Seller
      const newSeller = await tx.seller.create({
        data: {
          name: pending.fullName.trim(),
          email: pending.email,
          phone: pending.phone,
          passwordHash: pending.passwordHash,
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
          email: pending.email,
          phone: pending.phone,
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

      // Create default categories for the new store
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

    // 4. Clear the OTP from pending store
    clearPendingVerification(cleanEmail);

    // 5. Sign JWT Session Token
    const token = await signToken({
      sellerId: result.seller.id,
      email: result.seller.email,
      storeId: result.store.id,
      role: result.seller.role,
    });

    // 6. Set secure HTTP-only cookie
    await setSessionCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: "Email and phone verified successfully! Welcome to SUVORA.",
        seller: {
          id: result.seller.id,
          name: result.seller.name,
          email: result.seller.email,
          phone: result.seller.phone,
          role: result.seller.role,
          isVerified: result.seller.isVerified,
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
