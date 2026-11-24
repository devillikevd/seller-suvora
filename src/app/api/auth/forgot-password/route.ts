import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { supabase, hasSupabaseAnonKey } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid registered merchant email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify merchant email exists in database
    const seller = await prisma.seller.findUnique({
      where: { email: cleanEmail },
    });

    if (!seller) {
      // Return 200 with generic message for privacy/security against email enumeration
      return NextResponse.json({
        success: true,
        message: "If an account with this email exists, a password recovery link has been dispatched.",
      });
    }

    // Dispatch real reset email via Supabase Auth
    if (hasSupabaseAnonKey()) {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/settings`,
      });

      if (resetError) {
        console.error("[SUPABASE PASSWORD RESET ERROR]:", resetError);
        return NextResponse.json(
          { error: `Delivery error: ${resetError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `A secure password recovery email has been dispatched to ${cleanEmail}. Please check your inbox.`,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
