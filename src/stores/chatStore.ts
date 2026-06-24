import { create } from "zustand";
import type { Message, Conversation, MediaAttachment } from "../types";
import { useNotificationStore } from "./notificationStore";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToConversation,
  subscribeToConversationList,
  uploadMedia,
} from "../services/chatService";

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversationId: string | null;
  loading: boolean;
  error: string | null;

  initialize: (userId: string) => Promise<void>;
  loadConversations: (userId: string) => Promise<void>;
  loadMessages: (conversationId: string, userId: string) => Promise<void>;
  sendTextMessage: (conversationId: string, senderId: string, text: string) => Promise<void>;
  sendMediaMessage: (
    conversationId: string,
    senderId: string,
    file: File,
    mediaType: "image" | "video" | "voice"
  ) => Promise<void>;
  markRead: (convId: string, userId: string) => void;
  setActiveConversation: (id: string | null) => void;
  cleanup: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  activeConversationId: null,
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
      const msgs = await fetchMessages(conversationId);
      set((state) => ({
        messages: { ...state.messages, [conversationId]: msgs },
        loading: false,
      }));
      markMessagesAsRead(conversationId, userId);
    } catch (err) {
      set({ error: "Erreur de chargement", loading: false });
    }
  },

  sendTextMessage: async (conversationId: string, senderId: string, text: string) => {
    if (!text.trim()) return;

    const optimistic: Message = {
      id: `optimistic_${Date.now()}`,
      conversationId,
      senderId,
      text,
      photos: [],
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
      text,
      photos: mediaType === "image" ? [url] : [],
      media,
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

    const result = await sendMessage({ conversationId, senderId, text, media });
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

  cleanup: () => {
    set({ conversations: [], messages: {}, activeConversationId: null, error: null });
  },
}));
