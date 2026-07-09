import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders, authenticate, requireAdmin, errorResponse } from "../../_middleware.ts"

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
    await requireAdmin(supabase, userId)

    const url = new URL(req.url)
    const path = url.pathname.replace(/^\/api\/v1\/admin\/subscriptions/, "")
    const method = req.method

    if (method === "GET" && (path === "/" || path === "")) {
      const page = parseInt(url.searchParams.get("page") ?? "1")
      const limit = parseInt(url.searchParams.get("limit") ?? "20")
      const offset = (page - 1) * limit
      const status = url.searchParams.get("status")
      const planId = url.searchParams.get("plan_id")
      const userId_filter = url.searchParams.get("user_id")

      let query = supabase
        .from("subscriptions")
        .select("*, plan:plans(*), user:users(id, email, phone, first_name, last_name)", { count: "exact" })

      if (status) {
        query = query.eq("status", status)
      }
      if (planId) {
        query = query.eq("plan_id", planId)
      }
      if (userId_filter) {
        query = query.eq("user_id", userId_filter)
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return new Response(JSON.stringify({
        data: data ?? [],
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (method === "PUT") {
      const idMatch = path.match(/^\/([a-f0-9-]+)$/)
      if (!idMatch) {
        return errorResponse(404, "Subscription not found")
      }

      const body = await req.json()
      const updateData: Record<string, unknown> = {}
      const fields = ["plan_id", "status", "billing_cycle", "auto_renew", "tier", "coupon_id"]
      for (const field of fields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field]
        }
      }
      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from("subscriptions")
        .update(updateData)
        .eq("id", idMatch[1])
        .select("*, plan:plans(*)")
        .single()

      if (error) throw error
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (method === "POST") {
      const idMatch = path.match(/^\/([a-f0-9-]+)\/manage$/)
      if (!idMatch) {
        return errorResponse(404, "Subscription not found")
      }

      const body = await req.json()
      const action = body.action

      if (!action) {
        return errorResponse(400, "Missing required field: action")
      }

      const subscriptionId = idMatch[1]
      const now = new Date().toISOString()

      switch (action) {
        case "offer_premium": {
          if (!body.plan_id) {
            return errorResponse(400, "Missing required field: plan_id")
          }

          const { data: plan } = await supabase
            .from("plans")
            .select("trial_days")
            .eq("id", body.plan_id)
            .single()

          const trialDays = body.trial_days ?? plan?.trial_days ?? 30
          const trialEnd = new Date(now.getTime() + trialDays * 86400000).toISOString()

          const { data: offer, error } = await supabase
            .from("subscriptions")
            .update({
              plan_id: body.plan_id,
              status: "ACTIVE",
              tier: "premium_offer",
              trial_end: trialEnd,
              current_period_end: trialEnd,
              auto_renew: false,
              updated_at: now,
            })
            .eq("id", subscriptionId)
            .select("*, plan:plans(*)")
            .single()

          if (error) throw error

          await supabase.from("notifications").insert({
            user_id: offer.user_id,
            type: "premium_offer",
            title: "Offre premium activée",
            body: `Un abonnement premium vous a été offert jusqu'au ${new Date(trialEnd).toLocaleDateString("fr-FR")}.`,
            metadata: { subscription_id: subscriptionId, plan_id: body.plan_id, trial_end: trialEnd },
          })

          return new Response(JSON.stringify(offer), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          })
        }

        case "suspend": {
          const { error } = await supabase
            .from("subscriptions")
            .update({
              status: "FAILED",
              auto_renew: false,
              updated_at: now,
            })
            .eq("id", subscriptionId)

          if (error) throw error

          await supabase.from("notifications").insert({
            user_id: userId,
            type: "subscription_suspended",
            title: "Abonnement suspendu",
            body: "Votre abonnement a été suspendu par l'administrateur.",
            metadata: { subscription_id: subscriptionId },
          })

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          })
        }

        case "cancel": {
          const { error } = await supabase
            .from("subscriptions")
            .update({
              status: "CANCELLED",
              canceled_at: now,
              auto_renew: false,
              updated_at: now,
            })
            .eq("id", subscriptionId)

          if (error) throw error

          await supabase.from("notifications").insert({
            user_id: userId,
            type: "subscription_cancelled",
            title: "Abonnement résilié",
            body: "Votre abonnement a été résilié par l'administrateur.",
            metadata: { subscription_id: subscriptionId },
          })

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          })
        }

        default:
          return errorResponse(400, `Unknown action: ${action}`)
      }
    }

    return errorResponse(405, "Method not allowed")
  } catch (err) {
    console.error("Admin subscriptions error:", err instanceof Error ? err.message : err)
    if (err instanceof Error && (err.message === "Unauthorized" || err.message === "Forbidden")) {
      return errorResponse(err.message === "Unauthorized" ? 401 : 403, err.message)
    }
    return errorResponse(500, "Internal server error")
  }
})
