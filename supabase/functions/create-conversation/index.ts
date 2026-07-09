// Ça Match — Create Conversation Edge Function
// Triggered by job lifecycle events (JOB_ACCEPTED, JOB_PAID).
// Creates a mission-bound conversation and inserts a system event.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface JobEvent {
  type: "JOB_ACCEPTED" | "JOB_PAID";
  job_id: string;
  client_id: string;
  professional_id: string;
  timestamp: string;
  metadata?: {
    category?: string;
    location?: string;
    price_estimate?: number;
    currency?: string;
    service_type?: "on_demand" | "scheduled";
  };
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const event: JobEvent = await req.json();

    // Validate required fields
    if (!event.job_id || !event.client_id || !event.professional_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: job_id, client_id, professional_id" }),
        { status: 400 }
      );
    }

    // Check if conversation already exists for this job
    const { data: existing } = await supabase
      .from("conversations")
      .select("id, state")
      .eq("job_id", event.job_id)
      .maybeSingle();

    if (existing) {
      // Conversation exists — update state to active if it was waiting
      if (existing.state === "waiting") {
        await supabase
          .from("conversations")
          .update({ state: "active" })
          .eq("id", existing.id);
      }
      return new Response(
        JSON.stringify({ id: existing.id, already_exists: true }),
        { status: 200 }
      );
    }

    // Create the conversation
    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .insert({
        job_id: event.job_id,
        participant_1: event.client_id,
        participant_2: event.professional_id,
        state: "active",
        metadata: {
          mission_phase: "accepted",
          flags: { dispute: false, support_joined: false, pinned: false },
          job_snapshot: {
            category: event.metadata?.category || "",
            location: event.metadata?.location || "",
            price_estimate: event.metadata?.price_estimate || 0,
            currency: event.metadata?.currency || "XOF",
            service_type: event.metadata?.service_type || "on_demand",
          },
          created_from: "job_accept",
        },
      })
      .select("id")
      .single();

    if (convError || !conv) {
      console.error("Failed to create conversation:", convError?.message);
      return new Response(
        JSON.stringify({ error: "Failed to create conversation", details: convError?.message }),
        { status: 500 }
      );
    }

    // Insert system event message
    const eventContent = event.type === "JOB_PAID"
      ? "✔ Paiement reçu. La conversation est ouverte."
      : "✔ Mission acceptée. La conversation est ouverte.";

    await supabase.rpc("insert_system_event", {
      p_conversation_id: conv.id,
      p_event_type: event.type.toLowerCase(),
      p_content: eventContent,
      p_metadata: { triggered_by: event.type, job_id: event.job_id },
    });

    // Notify both participants
    const participants = [event.client_id, event.professional_id];
    for (const userId of participants) {
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "conversation_created",
        title: "Nouvelle conversation",
        body: eventContent,
        metadata: { conversation_id: conv.id, job_id: event.job_id },
      });
    }

    return new Response(
      JSON.stringify({ id: conv.id, already_exists: false }),
      { status: 201 }
    );
  } catch (err) {
    console.error("Unexpected error:", err instanceof Error ? err.message : err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
});
