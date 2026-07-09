import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders, authenticate, errorResponse } from "../_middleware.ts"

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const userId = await authenticate(req)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    )

    const url = new URL(req.url)
    const path = url.pathname.replace(/^\/api\/v1\/subscriptions/, "")
    const method = req.method

    if (method === "GET" && path === "/current") {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, plan:plans(*)")
        .eq("user_id", userId)
        .in("status", ["TRIAL", "ACTIVE", "PAST_DUE"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (method === "GET" && path === "/history") {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, plan:plans(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return new Response(JSON.stringify(data ?? []), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (method === "POST") {
      const body = await req.json()

      if (path === "/create") {
        if (!body.plan_id || !body.billing_cycle) {
          return errorResponse(400, "Missing required fields: plan_id, billing_cycle")
        }

        const { data: existing } = await supabase
          .from("subscriptions")
          .select("id, status")
          .eq("user_id", userId)
          .in("status", ["TRIAL", "ACTIVE", "PAST_DUE"])
          .maybeSingle()

        if (existing) {
          return errorResponse(409, "User already has an active subscription")
        }

        const { data: plan } = await supabase
          .from("plans")
          .select("trial_days")
          .eq("id", body.plan_id)
          .single()

        const trialDays = plan?.trial_days ?? 0
        const now = new Date()
        const trialEnd = trialDays > 0
          ? new Date(now.getTime() + trialDays * 86400000).toISOString()
          : null

        const { data, error } = await supabase
          .from("subscriptions")
          .insert({
            user_id: userId,
            plan_id: body.plan_id,
            tier: "active",
            status: trialDays > 0 ? "TRIAL" : "ACTIVE",
            billing_cycle: body.billing_cycle,
            current_period_start: now.toISOString(),
            current_period_end: trialEnd ?? new Date(now.getTime() + 30 * 86400000).toISOString(),
            trial_end: trialEnd,
            auto_renew: true,
            coupon_id: body.coupon_code ? null : null,
          })
          .select("*, plan:plans(*)")
          .single()

        if (error) throw error
        return new Response(JSON.stringify(data), {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      if (path === "/change-plan") {
        if (!body.subscription_id || !body.new_plan_id) {
          return errorResponse(400, "Missing required fields: subscription_id, new_plan_id")
        }

        const { data, error } = await supabase
          .from("subscriptions")
          .update({
            plan_id: body.new_plan_id,
            tier: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.subscription_id)
          .eq("user_id", userId)
          .select("*, plan:plans(*)")
          .single()

        if (error) throw error
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      if (path === "/cancel") {
        if (!body.subscription_id) {
          return errorResponse(400, "Missing required field: subscription_id")
        }

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "CANCELLED",
            canceled_at: new Date().toISOString(),
            auto_renew: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.subscription_id)
          .eq("user_id", userId)

        if (error) throw error
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      if (path === "/reactivate") {
        if (!body.subscription_id) {
          return errorResponse(400, "Missing required field: subscription_id")
        }

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("id", body.subscription_id)
          .eq("user_id", userId)
          .single()

        if (!sub || sub.status !== "CANCELLED") {
          return errorResponse(400, "Only cancelled subscriptions can be reactivated")
        }

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "ACTIVE",
            canceled_at: null,
            auto_renew: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.subscription_id)
          .eq("user_id", userId)

        if (error) throw error
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      return errorResponse(404, "Unknown subscription action")
    }

    return errorResponse(405, "Method not allowed")
  } catch (err) {
    console.error("Subscriptions error:", err instanceof Error ? err.message : err)
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse(401, "Unauthorized")
    }
    return errorResponse(500, "Internal server error")
  }
})
