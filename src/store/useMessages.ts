import { create } from "zustand";

export interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface MessagesState {
  conversations: Conversation[];
  activeChatId: string | null;
  loading: boolean;
  setConversations: (conversations: Conversation[]) => void;
  setActiveChat: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  markAsRead: (partnerId: string) => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  conversations: [],
  activeChatId: null,
  loading: false,
  setConversations: (conversations) => set({ conversations }),
  setActiveChat: (id) => set({ activeChatId: id }),
  setLoading: (loading) => set({ loading }),
  markAsRead: (partnerId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.partnerId === partnerId ? { ...c, unreadCount: 0 } : c
      ),
    })),
}));
