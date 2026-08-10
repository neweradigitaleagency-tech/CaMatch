import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * SANDBOX MODE — VITE_DEMO_MODE=true force le mode démo (aucun appel BDD),
 * même si les clés Supabase sont présentes dans l'environnement.
 * C'est le mode par défaut pour le prototype : réversible à tout moment.
 */
export function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === "true";
}

const missingEnv = !supabaseUrl || !supabaseAnonKey || isDemoMode();

if (missingEnv) {
  console.warn(
    `[sandbox] ${isDemoMode() ? "VITE_DEMO_MODE=true" : "clés Supabase absentes"} — mode démo sans base de données.`
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
      global: {
        fetch: (url, init) =>
          fetch(url, { ...init, signal: AbortSignal.timeout(15000) }),
      },
    });

export function isSupabaseReady(): boolean {
  return !missingEnv;
}
