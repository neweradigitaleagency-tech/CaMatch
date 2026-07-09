import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders, authenticate, errorResponse } from "../_middleware.ts"

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace(/^\/api\/v1\/payments/, "")
    const method = req.method

    if (method === "POST" && path === "/webhook") {
      const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "")
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
      if (authHeader !== serviceRoleKey) {
        return errorResponse(401, "Unauthorized")
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        serviceRoleKey ?? "",
        { auth: { persistSession: false } }
      )

      const payload = await req.json()
      const provider = req.headers.get("x-provider") ?? "unknown"
      const eventType = payload.event ?? payload.type ?? "unknown"

      const { data: payment, error: payError } = await supabase
        .from("payments")
        .upsert({
          user_id: payload.user_id ?? payload.customer?.id,
          subscription_id: payload.subscription_id ?? null,
          provider: provider,
          provider_transaction_id: payload.id ?? payload.transaction_id,
          amount: payload.amount?.total ?? payload.amount ?? 0,
          currency: payload.currency ?? "XOF",
          status: eventType === "payment.success" || eventType === "charge.completed"
            ? "captured"
            : eventType === "payment.failed"
            ? "failed"
            : "pending",
          provider_response: payload,
          metadata: { event: eventType, provider },
        })
        .select("id")
        .single()

      if (payError) throw payError

      if (payment && (eventType === "payment.success" || eventType === "charge.completed")) {
        await supabase
          .from("subscriptions")
          .update({
            status: "ACTIVE",
            updated_at: new Date().toISOString(),
          })
          .eq("id", payload.subscription_id)
      }

      return new Response(JSON.stringify({ received: true, payment_id: payment?.id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const userId = await authenticate(req)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    )

    if (method === "POST" && path === "/create") {
      const body = await req.json()
      if (!body.subscription_id || !body.provider || !body.amount) {
        return errorResponse(400, "Missing required fields: subscription_id, provider, amount")
      }

      const { data, error } = await supabase
        .from("payments")
        .insert({
          user_id: userId,
          subscription_id: body.subscription_id,
          provider: body.provider,
          amount: body.amount,
          currency: body.currency ?? "XOF",
          status: "pending",
          metadata: body.metadata ?? null,
        })
        .select("*, invoice:invoices(*)")
        .single()

      if (error) throw error
      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (method === "GET" && path === "/history") {
      const page = parseInt(url.searchParams.get("page") ?? "1")
      const limit = parseInt(url.searchParams.get("limit") ?? "20")
      const offset = (page - 1) * limit

      const { data, error, count } = await supabase
        .from("payments")
        .select("*, invoice:invoices(*)", { count: "exact" })
        .eq("user_id", userId)
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

    return errorResponse(405, "Method not allowed")
  } catch (err) {
    console.error("Payments error:", err instanceof Error ? err.message : err)
    if (err instanceof Error && err.message === "Unauthorized") {
      return errorResponse(401, "Unauthorized")
    }
    return errorResponse(500, "Internal server error")
  }
})
