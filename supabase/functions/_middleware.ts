import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-provider",
  "Access-Control-Max-Age": "86400",
}

export function errorResponse(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

export async function authenticate(req: Request): Promise<string> {
  const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "")
  if (!authHeader) {
    throw new Error("Unauthorized")
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${authHeader}` } },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser(authHeader)

  if (error || !user) {
    throw new Error("Unauthorized")
  }

  return user.id
}

export async function requireAdmin(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<void> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role:roles(name)")
    .eq("user_id", userId)
    .maybeSingle()

  if (error || !data) {
    throw new Error("Forbidden")
  }

  const role = (data as { role: { name: string } }).role?.name
  if (role !== "platform_admin") {
    throw new Error("Forbidden")
  }
}

export async function requireFeature(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  featureCode: string
): Promise<boolean> {
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_id")
    .eq("user_id", userId)
    .in("status", ["TRIAL", "ACTIVE", "PAST_DUE"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!sub?.plan_id) return false

  const { data: feature } = await supabase
    .from("features")
    .select("id")
    .eq("code", featureCode)
    .maybeSingle()

  if (!feature) return false

  const { data: pf } = await supabase
    .from("plan_features")
    .select("enabled")
    .eq("plan_id", sub.plan_id)
    .eq("feature_id", feature.id)
    .maybeSingle()

  return pf?.enabled ?? false
}
