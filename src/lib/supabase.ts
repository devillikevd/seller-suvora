import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zuumucappoenyftnwokz.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey || "dummy-anon-key-placeholder", {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export function hasSupabaseAnonKey(): boolean {
  return Boolean(
    supabaseAnonKey &&
    supabaseAnonKey.trim().length > 0 &&
    supabaseAnonKey !== "dummy-anon-key-placeholder"
  );
}

