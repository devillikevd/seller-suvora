import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signToken, setSessionCookie, hashPassword } from "@/lib/auth";
import { getPendingVerification, clearPendingVerification, verifyPendingOtp } from "@/lib/otp-service";
import { supabase, hasSupabaseAnonKey } from "@/lib/supabase";

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

    // 1. Verify token with Supabase Auth if Anon Key is present
    if (hasSupabaseAnonKey()) {
      let { error: supabaseError } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanOtp,
        type: "email",
      });

      // If "email" type didn't match (e.g. if Supabase categorized as magiclink or signup OTP), retry with magiclink then signup
      if (supabaseError) {
        const magicRetry = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanOtp,
          type: "magiclink",
        });

        if (!magicRetry.error) {
          supabaseError = null;
        } else {
          const signupRetry = await supabase.auth.verifyOtp({
            email: cleanEmail,
            token: cleanOtp,
            type: "signup",
          });

          if (!signupRetry.error) {
            supabaseError = null;
          } else {
            console.error("[SUPABASE VERIFY OTP ERROR]:", supabaseError, magicRetry.error, signupRetry.error);
            return NextResponse.json(
              { error: `Invalid code: ${supabaseError.message || magicRetry.error.message || signupRetry.error.message}. Please check the 6-digit code in your email.` },
              { status: 400 }
            );
          }
        }
      }
    } else {
      // Fallback verification if Anon Key is not yet set in .env
      const localVerified = verifyPendingOtp(cleanEmail, cleanOtp);
      if (!localVerified) {
        return NextResponse.json(
          { error: "Invalid or expired OTP code. Please enter the correct code from your email." },
          { status: 400 }
        );
      }
    }

    // 2. Retrieve pending registration details (from memory or request fallback)
    const pending = getPendingVerification(cleanEmail);

    const resolvedFullName = (pending?.fullName || body.fullName || "Merchant Owner").trim();
    const resolvedPhone = (pending?.phone || body.phone || "+91 98765 00000").trim();
    const resolvedStoreName = (pending?.storeName || body.storeName || `${resolvedFullName}'s Store`).trim();
    const resolvedPasswordHash =
      pending?.passwordHash ||
      (body.password ? await hashPassword(body.password) : await hashPassword("Seller@123456"));

    // 3. Generate unique slug
    const baseSlug = resolvedStoreName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 24);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

    // 4. Atomic transaction to create Seller and Store in Supabase PostgreSQL
    const result = await prisma.$transaction(async (tx) => {
      // Create Verified Seller
      const newSeller = await tx.seller.create({
        data: {
          name: resolvedFullName,
          email: cleanEmail,
          phone: resolvedPhone,
          passwordHash: resolvedPasswordHash,
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
          phone: resolvedPhone,
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

    // 5. Clear the OTP from pending store
    clearPendingVerification(cleanEmail);

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
        message: "Email verified successfully! Welcome to SUVORA.",
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
