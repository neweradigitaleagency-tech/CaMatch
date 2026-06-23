import { create } from "zustand";
import type { Message, Conversation } from "../types";
import { useNotificationStore } from "./notificationStore";

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversationId: string | null;
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (messages: Record<string, Message[]>) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (convId: string, message: Message) => void;
  markRead: (convId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  activeConversationId: null,
  setConversations: (conversations) => set({ conversations }),
  setMessages: (messages) => set({ messages }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  addMessage: (convId, message) => {
    const conv = get().conversations.find((c) => c.id === convId);
    if (conv) {
      useNotificationStore.getState().addNotification({
        type: "message",
        title: conv.otherUserName,
        body: message.text,
        actionUrl: `/messages/${convId}`,
      });
    }
    set((state) => {
      const convMessages = state.messages[convId] || [];
      return {
        messages: { ...state.messages, [convId]: [...convMessages, message] },
        conversations: state.conversations.map((c) =>
          c.id === convId
            ? { ...c, lastMessage: message.text, lastMessageAt: message.createdAt, unreadCount: (c.unreadCount || 0) + 1 }
            : c
        ),
      };
    });
  },
  markRead: (convId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === convId ? { ...c, unreadCount: 0 } : c
      ),
    })),
}));
