import { create } from "zustand";
import type { Message, Conversation, MediaAttachment, ConversationState } from "../types";
import { useNotificationStore } from "./notificationStore";
import {
  fetchConversations,
  fetchMessages,
  fetchConversationState,
  sendMessage,
  insertSystemEvent,
  markMessagesAsRead,
  updateConversationState,
  subscribeToConversation,
  subscribeToConversationList,
  uploadMedia,
  createConversation as createConversationService,
} from "../services/chatService";
import { MOCK_PROS } from "../services/mockData";

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversationId: string | null;
  conversationState: Record<string, { state: ConversationState; metadata: Conversation["metadata"] }>;
  loading: boolean;
  error: string | null;

  initialize: (userId: string) => Promise<void>;
  loadConversations: (userId: string) => Promise<void>;
  loadMessages: (conversationId: string, userId: string) => Promise<void>;
  loadConversationState: (conversationId: string) => Promise<void>;
  sendTextMessage: (conversationId: string, senderId: string, text: string) => Promise<void>;
  sendMediaMessage: (
    conversationId: string,
    senderId: string,
    file: File,
    mediaType: "image" | "video" | "voice"
  ) => Promise<void>;
  markRead: (convId: string, userId: string) => void;
  setActiveConversation: (id: string | null) => void;
  updateState: (convId: string, state: ConversationState) => void;
  getConversationByMission: (missionId: string) => Conversation | undefined;
  upsertConversation: (conv: Conversation) => void;
  appendMessages: (conversationId: string, msgs: Message[]) => void;
  createConversation: (params: {
    participant1: string;
    participant2: string;
    jobId?: string;
    metadata?: Partial<Conversation["metadata"]>;
  }) => Promise<Conversation>;
  cleanup: () => void;
}

function mergeConversations(fetched: Conversation[], existing: Conversation[]): Conversation[] {
  const map = new Map<string, Conversation>();
  for (const c of fetched) map.set(c.id, c);
  for (const c of existing) if (!map.has(c.id)) map.set(c.id, c);
  return [...map.values()];
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  activeConversationId: null,
  conversationState: {},
  loading: false,
  error: null,

  initialize: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const convs = await fetchConversations(userId);
      set((state) => ({
        conversations: mergeConversations(convs, state.conversations),
        loading: false,
      }));
    } catch (err) {
      set({ error: "Erreur de chargement", loading: false });
    }
  },

  loadConversations: async (userId: string) => {
    const convs = await fetchConversations(userId);
    set((state) => ({
      conversations: mergeConversations(convs, state.conversations),
    }));
  },

  loadMessages: async (conversationId: string, userId: string) => {
    set({ loading: true, error: null, activeConversationId: conversationId });
    try {
      const [msgs, state] = await Promise.all([
        fetchMessages(conversationId),
        fetchConversationState(conversationId),
      ]);

      set((prev) => ({
        messages: { ...prev.messages, [conversationId]: msgs },
        conversationState: state
          ? { ...prev.conversationState, [conversationId]: state }
          : prev.conversationState,
        loading: false,
      }));

      markMessagesAsRead(conversationId, userId);
    } catch (err) {
      set({ error: "Erreur de chargement", loading: false });
    }
  },

  loadConversationState: async (conversationId: string) => {
    const state = await fetchConversationState(conversationId);
    if (state) {
      set((prev) => ({
        conversationState: { ...prev.conversationState, [conversationId]: state },
      }));
    }
  },

  sendTextMessage: async (conversationId: string, senderId: string, text: string) => {
    if (!text.trim()) return;

    const optimistic: Message = {
      id: `optimistic_${Date.now()}`,
      conversationId,
      senderId,
      type: "text",
      text,
      photos: [],
      riskScore: 0,
      moderationAction: "none",
      createdAt: new Date().toISOString(),
      status: "sent",
    };

    set((state) => {
      const convMessages = state.messages[conversationId] || [];
      return {
        messages: { ...state.messages, [conversationId]: [...convMessages, optimistic] },
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() }
            : c
        ),
      };
    });

    const result = await sendMessage({ conversationId, senderId, text });
    if (result) {
      set((state) => {
        const convMessages = (state.messages[conversationId] || []).filter(
          (m) => m.id !== optimistic.id
        );
        return {
          messages: { ...state.messages, [conversationId]: [...convMessages, result] },
        };
      });
    }
  },

  sendMediaMessage: async (
    conversationId: string,
    senderId: string,
    file: File,
    mediaType: "image" | "video" | "voice"
  ) => {
    const url = await uploadMedia(file, conversationId, mediaType);

    if (!url) return;

    const media: MediaAttachment[] = [
      {
        type: mediaType,
        url,
        duration: mediaType === "video" ? 30 : mediaType === "voice" ? undefined : undefined,
      },
    ];

    const text = mediaType === "voice" ? "🎤 Message vocal" : mediaType === "video" ? "🎬 Vidéo" : "📷 Photo";

    const optimistic: Message = {
      id: `optimistic_${Date.now()}`,
      conversationId,
      senderId,
      type: mediaType,
      text,
      photos: mediaType === "image" ? [url] : [],
      media,
      riskScore: 0,
      moderationAction: "none",
      createdAt: new Date().toISOString(),
      status: "sent",
    };

    set((state) => {
      const convMessages = state.messages[conversationId] || [];
      return {
        messages: { ...state.messages, [conversationId]: [...convMessages, optimistic] },
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() }
            : c
        ),
      };
    });

    const result = await sendMessage({ conversationId, senderId, type: mediaType, text, media });
    if (result) {
      set((state) => {
        const convMessages = (state.messages[conversationId] || []).filter(
          (m) => m.id !== optimistic.id
        );
        return {
          messages: { ...state.messages, [conversationId]: [...convMessages, result] },
        };
      });
    }
  },

  markRead: (convId, userId) => {
    markMessagesAsRead(convId, userId);
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === convId ? { ...c, unreadCount: 0 } : c
      ),
    }));
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  updateState: (convId, state) => {
    updateConversationState(convId, state);
    set((prev) => ({
      conversations: prev.conversations.map((c) =>
        c.id === convId ? { ...c, state } : c
      ),
    }));
  },

  getConversationByMission: (missionId: string) => {
    return get().conversations.find((c) => c.missionId === missionId);
  },

  upsertConversation: (conv) =>
    set((state) => {
      const exists = state.conversations.some((c) => c.id === conv.id);
      return {
        conversations: exists
          ? state.conversations.map((c) => (c.id === conv.id ? conv : c))
          : [conv, ...state.conversations],
      };
    }),

  appendMessages: (conversationId, msgs) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: msgs },
    })),

  createConversation: async ({ participant1, participant2, jobId, metadata }) => {
    const existing = get().conversations.find(
      (c) =>
        c.missionId === (jobId || "") &&
        c.participants.includes(participant1) &&
        c.participants.includes(participant2)
    );
    if (existing) {
      set({ activeConversationId: existing.id });
      return existing;
    }

    const id = await createConversationService({
      participant1,
      participant2,
      jobId: jobId || "",
      metadata,
    });

    const pro = MOCK_PROS.find((p) => p.id === participant2);
    const conv: Conversation = {
      id: id || `conv_mock_${Date.now()}`,
      participants: [participant1, participant2],
      missionId: jobId || "",
      state: "waiting",
      metadata: {
        mission_phase: undefined,
        flags: { dispute: false, support_joined: false, pinned: false },
        job_snapshot: {
          category: "",
          location: "",
          price_estimate: 0,
          currency: "XOF",
          service_type: "on_demand",
        },
        created_from: "manual",
        ...metadata,
      },
      lastMessage: "",
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      otherUserName: pro?.name || participant2.slice(0, 8),
      otherUserAvatar: pro?.avatarUrl || "",
    };

    get().upsertConversation(conv);
    set({ activeConversationId: conv.id });
    useNotificationStore.getState().addNotification({
      type: "message",
      title: "Nouvelle conversation",
      body: `Conversation avec ${conv.otherUserName}`,
      actionUrl: `/messages/${conv.id}`,
    });
    return conv;
  },

  cleanup: () => {
    set({
      conversations: [],
      messages: {},
      conversationState: {},
      activeConversationId: null,
      error: null,
    });
  },
}));
