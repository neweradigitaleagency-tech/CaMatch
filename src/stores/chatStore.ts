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
} from "../services/chatService";

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
  cleanup: () => void;
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
      set({ conversations: convs, loading: false });
    } catch (err) {
      set({ error: "Erreur de chargement", loading: false });
    }
  },

  loadConversations: async (userId: string) => {
    const convs = await fetchConversations(userId);
    set({ conversations: convs });
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
