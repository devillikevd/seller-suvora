import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zuumucappoenyftnwokz.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_6tKgAbasb2tXh-Y485Mrrw_cwRTjJYn";

console.log("Connecting to Supabase at:", url);
console.log("Using key prefix:", key.slice(0, 18) + "...");

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function testEmail() {
  const testEmail = "vyomdubeytopper1@gmail.com";
  console.log(`\n📧 Requesting Supabase to dispatch Email OTP to: ${testEmail}...`);

  const { data, error } = await supabase.auth.signInWithOtp({
    email: testEmail,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("❌ Supabase Error:", error.message, error.status);
    console.error("Full details:", error);
  } else {
    console.log("✅ Supabase accepted email OTP request successfully!");
    console.log("Response data:", data);
    console.log(`\n🎉 Check your inbox (${testEmail}) for the 6-digit verification code from Supabase!`);
  }
}

testEmail().catch(console.error);

