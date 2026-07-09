import { create } from "zustand"
import type { Boost, BoostType } from "../types/subscription"
import { createBoost, fetchActiveBoosts, fetchBoostHistory, calculateBoostPrice, getBoostPrices } from "../services/boostService"

interface BoostState {
  activeBoosts: Boost[]
  boostHistory: Boost[]
  loading: boolean
  error: string | null

  fetchActive: (userId: string) => Promise<void>
  fetchHistory: (userId: string) => Promise<void>
  createBoost: (input: { user_id: string; boost_type: BoostType; duration_days: number }) => Promise<Boost>
  calculatePrice: (type: BoostType, durationDays: number) => number
  getPrices: () => Record<BoostType, { daily: number; weekly: number; monthly: number }>
  clearError: () => void
}

export const useBoostStore = create<BoostState>((set) => ({
  activeBoosts: [],
  boostHistory: [],
  loading: false,
  error: null,

  fetchActive: async (userId: string) => {
    try {
      const boosts = await fetchActiveBoosts(userId)
      set({ activeBoosts: boosts })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  fetchHistory: async (userId: string) => {
    try {
      const history = await fetchBoostHistory(userId)
      set({ boostHistory: history })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  createBoost: async (input) => {
    set({ loading: true, error: null })
    try {
      const boost = await createBoost(input)
      set((s) => ({ activeBoosts: [...s.activeBoosts, boost] }))
      return boost
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  calculatePrice: (type, durationDays) => calculateBoostPrice(type, durationDays),
  getPrices: () => getBoostPrices(),

  clearError: () => set({ error: null }),
}))
