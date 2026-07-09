import { supabase, isSupabaseReady } from "./supabase";
import type { Message, Conversation, MediaAttachment, ConversationState, MessageType, ModerationAction } from "../types";
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_PROS } from "./mockData";

const STORAGE_BUCKET = "chat_media";

// ─── Platform security: detect payment bypass / contact sharing ───

const PLATFORM_PATTERNS: { pattern: RegExp; label: string; severity: number }[] = [
  { pattern: /whatsapp/i, label: "whatsapp", severity: 2 },
  { pattern: /telegram/i, label: "telegram", severity: 2 },
  { pattern: /signal/i, label: "signal", severity: 3 },
  { pattern: /instagram/i, label: "instagram", severity: 1 },
  { pattern: /snapchat/i, label: "snapchat", severity: 1 },
  { pattern: /facebook/i, label: "facebook", severity: 1 },
  { pattern: /discord/i, label: "discord", severity: 2 },
  { pattern: /messenger/i, label: "messenger", severity: 1 },
  { pattern: /écris-moi en privé/i, label: "private_contact", severity: 3 },
  { pattern: /appelle-moi/i, label: "private_contact", severity: 3 },
  { pattern: /je te paie en dehors/i, label: "off_platform_payment", severity: 5 },
  { pattern: /paiement (hors|en dehors|direct)/i, label: "off_platform_payment", severity: 5 },
  { pattern: /(\+?\d[\d\s.-]{7,}\d)/g, label: "phone", severity: 3 },
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, label: "email", severity: 3 },
  { pattern: /\b(?:FR\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{3})\b/i, label: "iban", severity: 5 },
  { pattern: /\b\d{16}\b/g, label: "card_number", severity: 5 },
];

interface SafetyCheckResult {
  sanitized: string;
  riskScore: number;
  flaggedTerms: string[];
  action: ModerationAction;
}

export function checkMessageSafety(text: string): SafetyCheckResult {
  let sanitized = text;
  const flaggedTerms: string[] = [];
  let riskScore = 0;

  for (const { pattern, label, severity } of PLATFORM_PATTERNS) {
    if (pattern.test(text)) {
      flaggedTerms.push(label);
      riskScore += severity;
      sanitized = sanitized.replace(pattern, `[${label} masqué]`);
    }
  }

  let action: ModerationAction = "none";
  if (riskScore >= 8) action = "blocked";
  else if (riskScore >= 5) action = "warned";
  else if (riskScore >= 3) action = "reported";

  return { sanitized, riskScore, flaggedTerms, action };
}

// ─── Upload helpers ───

export async function uploadMedia(
  file: File,
  conversationId: string,
  type: "image" | "video" | "voice"
): Promise<string | null> {
  if (!isSupabaseReady()) {
    return uploadLocal(file);
  }

  const ext = file.name.split(".").pop() || (type === "voice" ? "webm" : type === "video" ? "mp4" : "jpg");
  const path = `${conversationId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    } as any);

  if (error) {
    console.error("Upload failed:", error.message);
    return uploadLocal(file);
  }

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return urlData?.publicUrl || null;
}

function uploadLocal(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

// ─── Conversations ───

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  if (!isSupabaseReady()) {
    return MOCK_CONVERSATIONS;
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order("last_message_at", { ascending: false } as any);

  if (error) {
    console.error("fetchConversations error:", error.message);
    return [];
  }

  const rows = data as any[];

  const otherIds = rows.map((row) =>
    row.participant_1 === userId ? row.participant_2 : row.participant_1
  );
  const profiles = await batchFetchProfiles(otherIds);

  const convIds = rows.map((r) => r.id);

  const [unreadResults, lastMsgResults] = await Promise.all([
    Promise.all(
      convIds.map((id) =>
        supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", id)
          .eq("sender_id", otherIds[convIds.indexOf(id)])
          .eq("is_read", false)
      )
    ),
    Promise.all(
      convIds.map((id) =>
        supabase
          .from("messages")
          .select("content, type, media_type, created_at")
          .eq("conversation_id", id)
          .order("created_at", { ascending: false } as any)
          .limit(1)
      )
    ),
  ]);

  const convs = rows.map((row, i) => {
    const otherId = otherIds[i];
    const profile = profiles[otherId];
    const lastMsg = lastMsgResults[i]?.data as any[] | undefined;
    const count = unreadResults[i]?.count || 0;

    let lastMessageText = "";
    if (lastMsg && lastMsg.length > 0) {
      const m = lastMsg[0] as any;
      if (m.content) lastMessageText = m.content;
      else if (m.type === "voice") lastMessageText = "🎤 Message vocal";
      else if (m.type === "video") lastMessageText = "🎬 Vidéo";
      else if (m.type === "image") lastMessageText = "📷 Photo";
      else if (m.type === "system") lastMessageText = "🔔 Notification";
      else if (m.type === "event") lastMessageText = "";
      else lastMessageText = "📎 Fichier";
    }

    const meta = typeof row.metadata === "object" && row.metadata !== null
      ? row.metadata : {};

    return {
      id: row.id,
      participants: [row.participant_1, row.participant_2],
      missionId: row.job_id || "",
      state: (row.state || "waiting") as ConversationState,
      metadata: {
        mission_phase: (meta as any).mission_phase || undefined,
        flags: {
          dispute: !!(meta as any).flags?.dispute,
          support_joined: !!(meta as any).flags?.support_joined,
          pinned: !!(meta as any).flags?.pinned,
        },
        job_snapshot: {
          category: (meta as any).job_snapshot?.category || "",
          location: (meta as any).job_snapshot?.location || "",
          price_estimate: (meta as any).job_snapshot?.price_estimate || 0,
          currency: (meta as any).job_snapshot?.currency || "XOF",
          service_type: (meta as any).job_snapshot?.service_type || "on_demand",
        },
        created_from: (meta as any).created_from || "manual",
      },
      lastMessage: lastMessageText,
      lastMessageAt: row.last_message_at || row.created_at,
      unreadCount: count || 0,
      otherUserName: profile?.name || otherId.slice(0, 8),
      otherUserAvatar: profile?.avatarUrl || "",
    };
  });

  return convs;
}

async function batchFetchProfiles(userIds: string[]): Promise<Record<string, { name: string; avatarUrl: string }>> {
  if (userIds.length === 0) return {};

  if (!isSupabaseReady()) {
    const result: Record<string, { name: string; avatarUrl: string }> = {};
    for (const id of userIds) {
      const pro = MOCK_PROS.find((p) => p.id === id);
      if (pro) result[id] = { name: pro.name, avatarUrl: pro.avatarUrl || "" };
    }
    return result;
  }

  const uniqueIds = [...new Set(userIds)];
  const result: Record<string, { name: string; avatarUrl: string }> = {};

  const [proRows, clientRows] = await Promise.all([
    supabase
      .from("professional_profiles")
      .select("user_id, first_name, last_name, avatar_url")
      .in("user_id", uniqueIds),
    supabase
      .from("client_profiles")
      .select("user_id, first_name, last_name, avatar_url")
      .in("user_id", uniqueIds),
  ]);

  for (const row of (proRows.data || []) as any[]) {
    result[row.user_id] = {
      name: `${row.first_name} ${row.last_name}`,
      avatarUrl: row.avatar_url || "",
    };
  }
  for (const row of (clientRows.data || []) as any[]) {
    if (!result[row.user_id]) {
      result[row.user_id] = {
        name: `${row.first_name} ${row.last_name}`,
        avatarUrl: row.avatar_url || "",
      };
    }
  }

  return result;
}

// ─── Messages ───

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  if (!isSupabaseReady()) {
    return MOCK_MESSAGES[conversationId] || [];
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true } as any);

  if (error) {
    console.error("fetchMessages error:", error.message);
    return [];
  }

  return (data as any[]).map(mapRowToMessage);
}

function mapRowToMessage(row: any): Message {
  const media: MediaAttachment[] = [];
  if (row.media_url && row.type && ["image", "video", "voice", "pdf"].includes(row.type)) {
    media.push({
      type: row.type,
      url: row.media_url,
      duration: row.media_duration || undefined,
    });
  }

  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id || null,
    type: (row.type || "text") as MessageType,
    text: row.content || "",
    photos: row.type === "image" && row.media_url ? [row.media_url] : [],
    media: media.length > 0 ? media : undefined,
    metadata: row.metadata || undefined,
    riskScore: row.risk_score || 0,
    moderationAction: row.moderation_action || "none",
    createdAt: row.created_at || new Date().toISOString(),
    status: row.is_read ? "read" : row.created_at ? "delivered" : "sent",
  };
}

// ─── Send message ───

export async function sendMessage(params: {
  conversationId: string;
  senderId: string;
  type?: MessageType;
  text: string;
  media?: MediaAttachment[];
  metadata?: Record<string, unknown>;
}): Promise<Message | null> {
  const safety = checkMessageSafety(params.text);
  const type = params.type || "text";
  const mediaItem = params.media?.[0];
  const mediaUrl = mediaItem?.url || null;
  const mediaDuration = mediaItem?.duration || null;

  if (!isSupabaseReady()) {
    return {
      id: `local_${Date.now()}`,
      conversationId: params.conversationId,
      senderId: params.senderId,
      type,
      text: safety.sanitized,
      photos: type === "image" && mediaUrl ? [mediaUrl] : [],
      media: params.media,
      metadata: params.metadata,
      riskScore: safety.riskScore,
      moderationAction: safety.action,
      createdAt: new Date().toISOString(),
      status: "sent",
    };
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      sender_id: params.senderId,
      type,
      content: safety.sanitized,
      media_type: type === "image" || type === "video" || type === "voice" || type === "pdf" ? type : null,
      media_url: mediaUrl,
      media_duration: mediaDuration,
      metadata: params.metadata || null,
      risk_score: safety.riskScore,
      moderation_action: safety.action,
      is_read: false,
    } as any)
    .select()
    .single();

  if (error) {
    console.error("sendMessage error:", error.message);
    return null;
  }

  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
    } as any)
    .eq("id", params.conversationId);

  return mapRowToMessage(data);
}

// ─── System event message (backend-driven) ───

export async function insertSystemEvent(params: {
  conversationId: string;
  event: string;
  content: string;
  metadata?: Record<string, unknown>;
}): Promise<Message | null> {
  if (!isSupabaseReady()) {
    return {
      id: `event_${Date.now()}`,
      conversationId: params.conversationId,
      senderId: null,
      type: "event",
      text: params.content,
      photos: [],
      metadata: { event: params.event, ...params.metadata },
      riskScore: 0,
      moderationAction: "none",
      createdAt: new Date().toISOString(),
      status: "delivered",
    };
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      sender_id: null,
      type: "event",
      content: params.content,
      metadata: { event: params.event, ...params.metadata },
      is_read: false,
    } as any)
    .select()
    .single();

  if (error) {
    console.error("insertSystemEvent error:", error.message);
    return null;
  }

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() } as any)
    .eq("id", params.conversationId);

  return mapRowToMessage(data);
}

// ─── Mark as read ───

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  if (!isSupabaseReady()) return;

  await supabase
    .from("messages")
    .update({ is_read: true, read_at: new Date().toISOString() } as any)
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .eq("is_read", false);
}

// ─── Update conversation state ───

export async function updateConversationState(
  conversationId: string,
  state: ConversationState,
  metadata?: Partial<Conversation["metadata"]>
): Promise<void> {
  if (!isSupabaseReady()) return;

  const updates: any = { state };

  if (metadata) {
    const { data: current } = await supabase
      .from("conversations")
      .select("metadata")
      .eq("id", conversationId)
      .single();

    const existingMeta = (current as any)?.metadata || {};
    updates.metadata = {
      ...existingMeta,
      ...metadata,
      flags: { ...existingMeta.flags, ...metadata.flags },
      job_snapshot: { ...existingMeta.job_snapshot, ...metadata.job_snapshot },
    };
  }

  await supabase
    .from("conversations")
    .update(updates as any)
    .eq("id", conversationId);
}

// ─── Fetch conversation (with state + metadata) ───

export async function fetchConversationState(conversationId: string): Promise<{
  state: ConversationState;
  metadata: Conversation["metadata"];
} | null> {
  if (!isSupabaseReady()) return null;

  const { data, error } = await supabase
    .from("conversations")
    .select("state, metadata")
    .eq("id", conversationId)
    .single();

  if (error || !data) return null;

  const row = data as any;
  const meta = typeof row.metadata === "object" && row.metadata !== null ? row.metadata : {};

  return {
    state: row.state || "waiting",
    metadata: {
      mission_phase: meta.mission_phase || undefined,
      flags: {
        dispute: !!meta.flags?.dispute,
        support_joined: !!meta.flags?.support_joined,
        pinned: !!meta.flags?.pinned,
      },
      job_snapshot: {
        category: meta.job_snapshot?.category || "",
        location: meta.job_snapshot?.location || "",
        price_estimate: meta.job_snapshot?.price_estimate || 0,
        currency: meta.job_snapshot?.currency || "XOF",
        service_type: meta.job_snapshot?.service_type || "on_demand",
      },
      created_from: meta.created_from || "manual",
    },
  };
}

// ─── Create conversation (Edge Function only — kept for dev fallback) ───

export async function createConversation(params: {
  participant1: string;
  participant2: string;
  jobId: string;
  metadata?: Partial<Conversation["metadata"]>;
}): Promise<string | null> {
  if (!isSupabaseReady()) {
    return `conv_mock_${Date.now()}`;
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      participant_1: params.participant1,
      participant_2: params.participant2,
      job_id: params.jobId,
      state: "waiting",
      metadata: params.metadata || {},
    } as any)
    .select()
    .single();

  if (error) {
    console.error("createConversation error:", error.message);
    return null;
  }

  return (data as any).id;
}

// ─── Find existing conversation ───

export async function findConversation(
  userId1: string,
  userId2: string,
  jobId: string
): Promise<string | null> {
  if (!isSupabaseReady()) {
    const found = MOCK_CONVERSATIONS.find(
      (c) =>
        c.missionId === jobId &&
        ((c.participants[0] === userId1 && c.participants[1] === userId2) ||
         (c.participants[0] === userId2 && c.participants[1] === userId1))
    );
    return found?.id || null;
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("id")
    .eq("job_id", jobId)
    .or(
      `and(participant_1.eq.${userId1},participant_2.eq.${userId2}),` +
      `and(participant_1.eq.${userId2},participant_2.eq.${userId1})`
    )
    .maybeSingle();

  if (error || !data) return null;
  return (data as any).id;
}

// ─── Realtime subscription ───

export function subscribeToConversation(
  conversationId: string,
  onMessage: (message: Message) => void
): () => void {
  if (!isSupabaseReady()) return () => {};

  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload: any) => {
        onMessage(mapRowToMessage(payload.new));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToConversationList(
  userId: string,
  onNewConversation: (conv: Conversation) => void
): () => void {
  if (!isSupabaseReady()) return () => {};

  const channel = supabase
    .channel(`conversations:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "conversations",
        filter: `participant_1=eq.${userId}`,
      },
      async () => {
        const convs = await fetchConversations(userId);
        const latest = convs[0];
        if (latest) onNewConversation(latest);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "conversations",
        filter: `participant_2=eq.${userId}`,
      },
      async () => {
        const convs = await fetchConversations(userId);
        const latest = convs[0];
        if (latest) onNewConversation(latest);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Storage helper: ensure bucket exists ───

export async function ensureStorageBucket(): Promise<void> {
  if (!isSupabaseReady()) return;

  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find((b: any) => b.name === STORAGE_BUCKET)) {
    await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024,
      allowedMimeTypes: [
        "image/jpeg", "image/png", "image/webp", "image/gif",
        "video/mp4", "video/webm", "video/quicktime",
        "audio/webm", "audio/mp3", "audio/ogg", "audio/wav",
        "application/pdf", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    } as any);
  }
}
