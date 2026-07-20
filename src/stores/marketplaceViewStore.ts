import { create } from "zustand"

type ProductSort = "popular" | "price_asc" | "price_desc" | "name"

interface MarketplaceViewStore {
  activeCategory: string
  sort: ProductSort
  showLowStock: boolean
  setActiveCategory: (cat: string) => void
  setSort: (sort: ProductSort) => void
  toggleLowStock: () => void
}

export const useMarketplaceViewStore = create<MarketplaceViewStore>((set) => ({
  activeCategory: "all",
  sort: "popular",
  showLowStock: false,
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setSort: (sort) => set({ sort }),
  toggleLowStock: () => set((s) => ({ showLowStock: !s.showLowStock })),
}))
