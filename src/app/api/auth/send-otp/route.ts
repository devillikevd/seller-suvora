import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { createPendingVerification } from "@/lib/otp-service";
import { supabase, hasSupabaseAnonKey } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, storeName, email, phone, password } = body;

    // 1. Validate fields
    if (!fullName || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Full name, email address, mobile number, and password are required." },
        { status: 400 }
      );
    }

    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { error: "Please provide a valid business email address." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    if (cleanPhone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { error: "Please provide a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Check if seller email or phone already exists in Supabase
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

    // 3. Hash password securely
    const passwordHash = await hashPassword(password);

    // 4. Store pending registration details locally in memory
    const { otp, expiresAt } = createPendingVerification({
      fullName,
      storeName,
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
    });

    // 5. Send real OTP to email via Supabase Auth
    if (hasSupabaseAnonKey()) {
      const { error: supabaseError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (supabaseError) {
        console.error("[SUPABASE EMAIL OTP ERROR]:", supabaseError);
        return NextResponse.json(
          {
            error: `Supabase Email Delivery Error: ${supabaseError.message}`,
          },
          { status: 400 }
        );
      }
    } else {
      console.warn(
        "⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured in .env yet. Please provide your Supabase anon public key to send live emails via Supabase."
      );
    }

    // 6. Return response WITHOUT showing OTP on client
    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your email inbox.`,
      email: cleanEmail,
      phone: cleanPhone,
      expiresAt,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
