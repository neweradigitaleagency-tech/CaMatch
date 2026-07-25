import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useSyncExternalStore } from "react"
import type { CartItem, MarketplaceOrder, MarketplaceOrderStatus } from "../types/marketplace"

interface CartState {
  items: CartItem[]
  orders: MarketplaceOrder[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: () => number
  subtotal: () => number
  checkout: (deliveryCity: string, deliveryAddress: string, paymentMethod: string) => string | null
  getOrder: (id: string) => MarketplaceOrder | undefined
}

export const useMarketplaceCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orders: [],

      addItem: (item) => {
        set((s) => {
          const safe = s.items ?? []
          const existing = safe.find((i) => i.productId === item.productId)
          if (existing) {
            return {
              items: safe.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }
          return { items: [...safe, item] }
        })
      },

      removeItem: (productId) => {
        set((s) => ({ items: (s.items ?? []).filter((i) => i.productId !== productId) }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((s) => ({
          items: (s.items ?? []).map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      itemCount: () => (get().items ?? []).reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => (get().items ?? []).reduce((sum, i) => sum + i.price * i.quantity, 0),

      checkout: (deliveryCity, deliveryAddress, paymentMethod) => {
        const state = get()
        const safeItems = state.items ?? []
        if (safeItems.length === 0) return null

        const COMMISSION_RATE = 0.10
        const subtotal = safeItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
        const deliveryCost = subtotal >= 50000 ? 0 : 3500
        const commission = Math.round(subtotal * COMMISSION_RATE)
        const sellerNet = subtotal - commission
        const total = subtotal + deliveryCost
        const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

        const order: MarketplaceOrder = {
          id: orderId,
          items: [...safeItems],
          subtotal,
          deliveryCost,
          commission,
          commissionRate: COMMISSION_RATE,
          sellerNet,
          total,
          status: "confirmed",
          deliveryCity,
          deliveryAddress,
          paymentMethod,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set((s) => ({
          orders: [order, ...(Array.isArray(s.orders) ? s.orders : [])],
          items: [],
        }))
        return orderId
      },

      getOrder: (id) => (get().orders ?? []).find((o) => o.id === id),
    }),
    {
      name: "cm-marketplace-cart",
      version: 0,
      migrate: () => ({ items: [], orders: [] }),
      partialize: (state) => ({
        items: Array.isArray(state.items) ? state.items : [],
        orders: Array.isArray(state.orders) ? state.orders : [],
      }),
      merge: (persisted, current) => ({
        ...current,
        items: Array.isArray((persisted as any)?.items) ? (persisted as any).items : [],
        orders: Array.isArray((persisted as any)?.orders) ? (persisted as any).orders : [],
      }),
    }
  )
)

function subscribeToHydration(callback: () => void) {
  const unsub = useMarketplaceCartStore.persist.onFinishHydration(callback)
  if (useMarketplaceCartStore.persist.hasHydrated()) {
    callback()
  }
  return unsub
}

function getHydrationSnapshot(): boolean {
  return useMarketplaceCartStore.persist.hasHydrated()
}

export function useCartHydrated(): boolean {
  return useSyncExternalStore(subscribeToHydration, getHydrationSnapshot, () => false)
}
