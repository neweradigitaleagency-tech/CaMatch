/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

function createMockClient(): SupabaseClient {
  const mock: Record<string, any> = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOtp: () => Promise.resolve({ error: null }),
      verifyOtp: () => Promise.resolve({ error: null }),
      signInWithPassword: () => Promise.resolve({ error: null }),
      signUp: () => Promise.resolve({ error: null }),
      setSession: () => Promise.resolve({ error: null }),
    },
    storage: {
      from: () => ({
        select: () => Promise.resolve({ data: null, error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
      }),
    },
    from: () => null,
    channel: () => null,
    rpc: () => Promise.resolve({ data: null, error: null }),
    functions: {},
    realtime: {},
    schema: () => null,
  };
  return mock as unknown as SupabaseClient;
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return createMockClient();
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
