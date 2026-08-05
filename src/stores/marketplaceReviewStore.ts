import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface UserReview {
  id: string
  orderId: string
  sellerId: string
  sellerName: string
  productName?: string
  rating: number
  comment: string
  createdAt: string
}

interface ReviewStore {
  reviews: UserReview[]
  addReview: (data: Omit<UserReview, "id" | "createdAt">) => UserReview
  getReviewByOrder: (orderId: string) => UserReview | undefined
}

export const useMarketplaceReviewStore = create<ReviewStore>()(
  persist(
    (set, get) => ({
      reviews: [],

      addReview: (data) => {
        const review: UserReview = {
          ...data,
          id: `urev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ reviews: [review, ...(Array.isArray(s.reviews) ? s.reviews : [])] }))
        return review
      },

      getReviewByOrder: (orderId) =>
        (get().reviews ?? []).find((r) => r.orderId === orderId),
    }),
    {
      name: "cm-marketplace-reviews",
      partialize: (state) => ({ reviews: Array.isArray(state.reviews) ? state.reviews : [] }),
    },
  ),
)
