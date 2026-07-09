import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders, authenticate, requireAdmin, errorResponse } from "../_middleware.ts"

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    )

    const url = new URL(req.url)
    const path = url.pathname.replace(/^\/api\/v1\/plans/, "")
    const method = req.method

    if (method === "GET") {
      if (path === "/" || path === "") {
        const { data, error } = await supabase
          .from("plans")
          .select("*, plan_features(feature:features(*), enabled, limit_value)")
          .eq("active", true)
          .order("display_order")

        if (error) throw error
        return new Response(JSON.stringify(data ?? []), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const idMatch = path.match(/^\/([a-f0-9-]+)$/)
      if (idMatch) {
        const { data, error } = await supabase
          .from("plans")
          .select("*, plan_features(feature:features(*), enabled, limit_value)")
          .eq("id", idMatch[1])
          .single()

        if (error) throw error
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      return errorResponse(404, "Plan not found")
    }

    if (method === "POST" && path === "/admin") {
      const userId = await authenticate(req)
      await requireAdmin(supabase, userId)

      const body = await req.json()
      if (!body.name || !body.type) {
        return errorResponse(400, "Missing required fields: name, type")
      }

      const { data, error } = await supabase
        .from("plans")
        .insert({
          name: body.name,
          type: body.type,
          description: body.description ?? null,
          price_monthly: body.price_monthly ?? 0,
          price_yearly: body.price_yearly ?? 0,
          currency: body.currency ?? "XOF",
          active: body.active ?? true,
          display_order: body.display_order ?? 0,
          badge: body.badge ?? null,
          recommended: body.recommended ?? false,
          trial_days: body.trial_days ?? 0,
        })
        .select("*")
        .single()

      if (error) throw error
      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (method === "PUT") {
      const idMatch = path.match(/^\/admin\/([a-f0-9-]+)$/)
      if (!idMatch) {
        return errorResponse(404, "Plan not found")
      }

      const userId = await authenticate(req)
      await requireAdmin(supabase, userId)

      const body = await req.json()
      const updateData: Record<string, unknown> = {}
      const fields = ["name", "type", "description", "price_monthly", "price_yearly", "currency", "active", "display_order", "badge", "recommended", "trial_days"]
      for (const field of fields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field]
        }
      }
      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from("plans")
        .update(updateData)
        .eq("id", idMatch[1])
        .select("*")
        .single()

      if (error) throw error
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (method === "DELETE") {
      const idMatch = path.match(/^\/admin\/([a-f0-9-]+)$/)
      if (!idMatch) {
        return errorResponse(404, "Plan not found")
      }

      const userId = await authenticate(req)
      await requireAdmin(supabase, userId)

      const { error } = await supabase
        .from("plans")
        .delete()
        .eq("id", idMatch[1])

      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return errorResponse(405, "Method not allowed")
  } catch (err) {
    console.error("Plans error:", err instanceof Error ? err.message : err)
    if (err instanceof Error && (err.message === "Unauthorized" || err.message === "Forbidden")) {
      return errorResponse(err.message === "Unauthorized" ? 401 : 403, err.message)
    }
    return errorResponse(500, "Internal server error")
  }
})
