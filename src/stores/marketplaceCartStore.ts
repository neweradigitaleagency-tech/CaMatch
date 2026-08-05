import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useSyncExternalStore } from "react"
import type { CartItem, MarketplaceOrder, MarketplaceOrderStatus, OrderDelivery, OrderEvent, MarketplaceDispute } from "../types/marketplace"
import { getCarrierForOrder, getTrackingCode, getEstimatedDeliveryAt } from "../data/delivery"

const EVENT_LABELS: Partial<Record<MarketplaceOrderStatus, { label: string; description: string }>> = {
  confirmed: { label: "Commande confirmée", description: "Votre paiement est sécurisé par Ça Match." },
  preparing: { label: "En préparation", description: "Le vendeur prépare votre colis." },
  shipped: { label: "Colis expédié", description: "Le colis est en route vers vous." },
  delivered: { label: "Commande livrée", description: "Colis remis, fonds libérés au vendeur." },
  cancelled: { label: "Commande annulée", description: "Aucun montant n'a été débité." },
  disputed: { label: "Litige ouvert", description: "Ça Match intervient pour vous aider." },
}

function createEvent(status: MarketplaceOrderStatus, at: string): OrderEvent {
  const meta = EVENT_LABELS[status] ?? { label: status, description: "" }
  return {
    id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    status,
    label: meta.label,
    description: meta.description,
    at,
  }
}

function createDelivery(orderId: string, city: string, createdAt: string): OrderDelivery {
  const carrier = getCarrierForOrder(orderId, city)
  return {
    carrier: carrier.name,
    trackingCode: getTrackingCode(orderId),
    contact: carrier.contact,
    estimatedAt: getEstimatedDeliveryAt(createdAt, city, orderId),
  }
}

function normalizeOrder(order: MarketplaceOrder): MarketplaceOrder {
  return {
    ...order,
    delivery:
      order.delivery ??
      createDelivery(order.id, order.deliveryCity, order.createdAt),
    events:
      order.events && order.events.length > 0
        ? order.events
        : [createEvent(order.status === "pending" ? "confirmed" : order.status, order.createdAt)],
  }
}

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
  updateOrderStatus: (orderId: string, status: MarketplaceOrderStatus) => void
  advanceOrder: (orderId: string) => void
  openDispute: (orderId: string, reason: string, description: string, evidence: string[]) => void
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
          delivery: createDelivery(orderId, deliveryCity, new Date().toISOString()),
          events: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        order.events = [createEvent("confirmed", order.createdAt)]

        set((s) => ({
          orders: [order, ...(Array.isArray(s.orders) ? s.orders : [])],
          items: [],
        }))
        return orderId
      },

      getOrder: (id) => {
        const order = (get().orders ?? []).find((o) => o.id === id)
        return order ? normalizeOrder(order) : undefined
      },

      updateOrderStatus: (orderId, status) => {
        const now = new Date().toISOString()
        set((s) => ({
          orders: (Array.isArray(s.orders) ? s.orders : []).map((o) => {
            if (o.id !== orderId) return o
            const normalized = normalizeOrder(o)
            const delivery: OrderDelivery = { ...normalized.delivery }
            if (status === "shipped") delivery.shippedAt = now
            if (status === "delivered") delivery.deliveredAt = now
            return {
              ...normalized,
              status,
              delivery,
              events: [...normalized.events, createEvent(status, now)],
              updatedAt: now,
            }
          }),
        }))
      },

      advanceOrder: (orderId) => {
        const order = (get().orders ?? []).find((o) => o.id === orderId)
        if (!order) return
        const next: MarketplaceOrderStatus | null =
          order.status === "confirmed" ? "preparing" :
          order.status === "preparing" ? "shipped" :
          null
        if (next) get().updateOrderStatus(orderId, next)
      },

      openDispute: (orderId, reason, description, evidence) => {
        const now = new Date().toISOString()
        const reference = `LIT-${orderId.slice(-6).toUpperCase()}-${Math.floor(Math.random() * 90 + 10)}`
        set((s) => ({
          orders: (Array.isArray(s.orders) ? s.orders : []).map((o) => {
            if (o.id !== orderId) return o
            const normalized = normalizeOrder(o)
            const dispute: MarketplaceDispute = {
              reference,
              reason,
              description,
              evidence,
              openedAt: now,
            }
            return {
              ...normalized,
              status: "disputed",
              dispute,
              events: [...normalized.events, createEvent("disputed", now)],
              updatedAt: now,
            }
          }),
        }))
      },
    }),
    {
      name: "cm-marketplace-cart",
      version: 1,
      migrate: (persisted, version) => {
        const p = persisted as { items?: CartItem[]; orders?: MarketplaceOrder[] } | undefined
        return {
          items: Array.isArray(p?.items) ? p.items : [],
          orders:
            Array.isArray(p?.orders) && version < 1
              ? p.orders.map(normalizeOrder)
              : Array.isArray(p?.orders)
                ? p.orders
                : [],
        }
      },
      partialize: (state) => ({
        items: Array.isArray(state.items) ? state.items : [],
        orders: Array.isArray(state.orders) ? state.orders : [],
      }),
      merge: (persisted, current) => ({
        ...current,
        items: Array.isArray((persisted as any)?.items) ? (persisted as any).items : [],
        orders: Array.isArray((persisted as any)?.orders)
          ? (persisted as any).orders.map(normalizeOrder)
          : [],
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
