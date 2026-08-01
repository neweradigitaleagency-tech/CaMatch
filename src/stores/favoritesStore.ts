import { create } from "zustand"
import { persist } from "zustand/middleware"

export type FavoriteType = "pro" | "product" | "boutique"

export interface FavoriteItem {
  type: FavoriteType
  id: string
  name: string
  subtitle?: string
  image?: string
  rating?: number
  priceLabel?: string
  route: string
  addedAt: string
}

interface FavoritesState {
  items: FavoriteItem[]
  toggle: (item: Omit<FavoriteItem, "addedAt">) => void
  isFavorite: (type: FavoriteType, id: string) => boolean
  remove: (type: FavoriteType, id: string) => void
  clear: () => void
  count: () => number
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (item) => {
        set((s) => {
          const safe = s.items ?? []
          const existing = safe.find((i) => i.type === item.type && i.id === item.id)
          if (existing) {
            return { items: safe.filter((i) => !(i.type === item.type && i.id === item.id)) }
          }
          return { items: [...safe, { ...item, addedAt: new Date().toISOString() }] }
        })
      },

      isFavorite: (type, id) =>
        (get().items ?? []).some((i) => i.type === type && i.id === id),

      remove: (type, id) => {
        set((s) => ({ items: (s.items ?? []).filter((i) => !(i.type === type && i.id === id)) }))
      },

      clear: () => set({ items: [] }),

      count: () => (get().items ?? []).length,
    }),
    { name: "cm_favorites" }
  )
)
