import { create } from "zustand";
import type { Message, Conversation } from "../types";

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

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  messages: {},
  activeConversationId: null,
  setConversations: (conversations) => set({ conversations }),
  setMessages: (messages) => set({ messages }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  addMessage: (convId, message) =>
    set((state) => {
      const convMessages = state.messages[convId] || [];
      return {
        messages: { ...state.messages, [convId]: [...convMessages, message] },
        conversations: state.conversations.map((c) =>
          c.id === convId
            ? { ...c, lastMessage: message.text, lastMessageAt: message.createdAt }
            : c
        ),
      };
    }),
  markRead: (convId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === convId ? { ...c, unreadCount: 0 } : c
      ),
    })),
}));
