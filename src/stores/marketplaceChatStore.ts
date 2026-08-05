import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ChatMessage, ChatSender } from "../types/marketplace"

interface ChatStore {
  messagesByOrder: Record<string, ChatMessage[]>
  sendMessage: (orderId: string, sender: ChatSender, text: string) => ChatMessage
  getMessages: (orderId: string) => ChatMessage[]
}

const normalize = (value: unknown): Record<string, ChatMessage[]> =>
  value && typeof value === "object" ? (value as Record<string, ChatMessage[]>) : {}

export const useMarketplaceChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messagesByOrder: {},

      sendMessage: (orderId, sender, text) => {
        const message: ChatMessage = {
          id: `cmsg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          orderId,
          sender,
          text: text.trim(),
          at: new Date().toISOString(),
        }
        const messages = get().messagesByOrder
        set({
          messagesByOrder: {
            ...messages,
            [orderId]: [...(messages[orderId] ?? []), message],
          },
        })
        return message
      },

      getMessages: (orderId) => get().messagesByOrder[orderId] ?? [],
    }),
    {
      name: "cm-marketplace-chat",
      partialize: (state) => ({ messagesByOrder: normalize(state.messagesByOrder) }),
    },
  ),
)
