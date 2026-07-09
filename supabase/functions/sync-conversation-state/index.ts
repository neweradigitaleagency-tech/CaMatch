// Ça Match — Sync Conversation State Edge Function
// Triggered by mission phase events (JOB_ON_SITE, JOB_WORKING, JOB_COMPLETED, etc.).
// Updates conversation state and inserts system events for mission milestones.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface MissionPhaseEvent {
  type:
    | "JOB_ON_SITE"
    | "JOB_WORKING"
    | "JOB_COMPLETED"
    | "JOB_CANCELLED"
    | "DISPUTE_OPENED"
    | "SUPPORT_JOINED"
    | "JOB_ARCHIVED";
  job_id: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const PHASE_MAP: Record<string, { state: string; mission_phase: string }> = {
  JOB_ON_SITE: { state: "active", mission_phase: "on_site" },
  JOB_WORKING: { state: "active", mission_phase: "working" },
  JOB_COMPLETED: { state: "read_only", mission_phase: "completed" },
  JOB_CANCELLED: { state: "archived", mission_phase: "completed" },
  JOB_ARCHIVED: { state: "archived", mission_phase: "completed" },
};

const EVENT_CONTENT: Record<string, (jobId: string) => string> = {
  JOB_ON_SITE: () => "🚗 Le professionnel est en route.",
  JOB_WORKING: () => "🔧 Le professionnel est arrivé et commence l'intervention.",
  JOB_COMPLETED: () => "✅ Mission terminée. Le chat reste disponible en lecture seule.",
  DISPUTE_OPENED: () => "⚠️ Un litige a été ouvert. Le support a rejoint la conversation.",
  SUPPORT_JOINED: () => "👋 Le support Ça Match a rejoint la conversation.",
  JOB_ARCHIVED: () => "📦 Cette conversation a été archivée. Lecture seule.",
};

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
    const event: MissionPhaseEvent = await req.json();

    if (!event.job_id || !event.type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: job_id, type" }),
        { status: 400 }
      );
    }

    // Find the conversation linked to this job
    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .select("id, state, metadata")
      .eq("job_id", event.job_id)
      .maybeSingle();

    if (convError || !conv) {
      console.error("Conversation not found for job:", event.job_id);
      return new Response(
        JSON.stringify({ error: "Conversation not found for this job" }),
        { status: 404 }
      );
    }

    const mapping = PHASE_MAP[event.type];

    if (mapping) {
      // Update conversation state + metadata mission_phase
      const currentMeta = (conv as any).metadata || {};
      const updatedMeta = {
        ...currentMeta,
        mission_phase: mapping.mission_phase,
      };

      await supabase
        .from("conversations")
        .update({
          state: mapping.state,
          metadata: updatedMeta,
        })
        .eq("id", (conv as any).id);

      // Insert system event message
      const contentFn = EVENT_CONTENT[event.type];
      if (contentFn) {
        await supabase.rpc("insert_system_event", {
          p_conversation_id: (conv as any).id,
          p_event_type: event.type.toLowerCase(),
          p_content: contentFn(event.job_id),
          p_metadata: { job_id: event.job_id, ...event.metadata },
        });
      }
    }

    // Handle dispute (flag in metadata, change state to active if currently read_only)
    if (event.type === "DISPUTE_OPENED") {
      const currentMeta = (conv as any).metadata || {};
      await supabase
        .from("conversations")
        .update({
          state: "active",
          metadata: {
            ...currentMeta,
            flags: { ...currentMeta.flags, dispute: true },
          },
        })
        .eq("id", (conv as any).id);

      const contentFn = EVENT_CONTENT.DISPUTE_OPENED;
      await supabase.rpc("insert_system_event", {
        p_conversation_id: (conv as any).id,
        p_event_type: "dispute_opened",
        p_content: contentFn(""),
        p_metadata: { job_id: event.job_id },
      });
    }

    // Handle support join
    if (event.type === "SUPPORT_JOINED") {
      const currentMeta = (conv as any).metadata || {};
      await supabase
        .from("conversations")
        .update({
          metadata: {
            ...currentMeta,
            flags: { ...currentMeta.flags, support_joined: true },
          },
        })
        .eq("id", (conv as any).id);

      const contentFn = EVENT_CONTENT.SUPPORT_JOINED;
      await supabase.rpc("insert_system_event", {
        p_conversation_id: (conv as any).id,
        p_event_type: "support_joined",
        p_content: contentFn(""),
        p_metadata: { job_id: event.job_id },
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err instanceof Error ? err.message : err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
});
