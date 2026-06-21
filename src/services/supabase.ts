import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const missingEnv = !supabaseUrl || !supabaseAnonKey;

if (missingEnv) {
  console.warn(
    "⚠️ VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set — running in demo mode."
  );
}

export const supabase = missingEnv
  ? (null as unknown as ReturnType<typeof createClient<Database>>)
  : createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

export function isSupabaseReady(): boolean {
  return !missingEnv;
}
