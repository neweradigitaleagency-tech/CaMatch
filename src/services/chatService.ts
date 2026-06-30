import { supabase, isSupabaseReady } from "./supabase";
import type { Message, Conversation, MediaAttachment } from "../types";
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_PROS } from "./mockData";

const STORAGE_BUCKET = "chat_media";

// ─── Phone/email filter ───

const PHONE_REGEX = /(\+?\d[\d\s.-]{7,}\d)/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export function filterSensitiveContent(text: string): string {
  return text
    .replace(PHONE_REGEX, "[contact masqué]")
    .replace(EMAIL_REGEX, "[email masqué]");
}

export function containsSensitiveContent(text: string): boolean {
  return PHONE_REGEX.test(text) || EMAIL_REGEX.test(text);
}

// ─── Upload helpers ───

export async function uploadMedia(
  file: File,
  conversationId: string,
  type: "image" | "video" | "voice" | "document"
): Promise<string | null> {
  if (!isSupabaseReady()) {
    return uploadLocal(file);
  }

  const ext = file.name.split(".").pop() || (type === "voice" ? "webm" : type === "video" ? "mp4" : type === "document" ? "pdf" : "jpg");
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
          .select("content, media_type, created_at")
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
      lastMessageText = m.content || (m.media_type === "voice" ? "Message vocal" : m.media_type === "video" ? "Vidéo" : "Photo");
    }

    return {
      id: row.id,
      participants: [row.participant_1, row.participant_2],
      missionId: row.job_id || undefined,
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
  if (row.media_url && row.media_type && row.media_type !== "none") {
    media.push({
      type: row.media_type,
      url: row.media_url,
      duration: row.media_duration || undefined,
    });
  }

  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    text: row.content || "",
    photos: row.media_type === "image" && row.media_url ? [row.media_url] : [],
    media: media.length > 0 ? media : undefined,
    createdAt: row.created_at || new Date().toISOString(),
    status: row.is_read ? "read" : row.created_at ? "delivered" : "sent",
  };
}

// ─── Send message ───

export async function sendMessage(params: {
  conversationId: string;
  senderId: string;
  text: string;
  media?: MediaAttachment[];
}): Promise<Message | null> {
  const text = filterSensitiveContent(params.text);
  const mediaItem = params.media?.[0];
  const mediaType = mediaItem?.type || "none";
  const mediaUrl = mediaItem?.url || null;
  const mediaDuration = mediaItem?.duration || null;

  if (!isSupabaseReady()) {
    return {
      id: `local_${Date.now()}`,
      conversationId: params.conversationId,
      senderId: params.senderId,
      text,
      photos: mediaType === "image" && mediaUrl ? [mediaUrl] : [],
      media: params.media,
      createdAt: new Date().toISOString(),
      status: "sent",
    };
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      sender_id: params.senderId,
      content: text,
      media_type: mediaType,
      media_url: mediaUrl,
      media_duration: mediaDuration,
      is_read: false,
    } as any)
    .select()
    .single();

  if (error) {
    console.error("sendMessage error:", error.message);
    return null;
  }

  // Update conversation's last_message_at
  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
    } as any)
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

// ─── Create conversation ───

export async function createConversation(params: {
  participant1: string;
  participant2: string;
  jobId?: string;
}): Promise<string | null> {
  if (!isSupabaseReady()) {
    return `conv_mock_${Date.now()}`;
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      participant_1: params.participant1,
      participant_2: params.participant2,
      job_id: params.jobId || null,
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
  userId2: string
): Promise<string | null> {
  if (!isSupabaseReady()) {
    const found = MOCK_CONVERSATIONS.find(
      (c) =>
        (c.participants[0] === userId1 && c.participants[1] === userId2) ||
        (c.participants[0] === userId2 && c.participants[1] === userId1)
    );
    return found?.id || null;
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("id")
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
