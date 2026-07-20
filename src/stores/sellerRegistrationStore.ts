import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SellerType, MarketplaceVertical, RegistrationStep, SellerRegistrationDraft } from "../types/marketplace"
import { DEFAULT_REGISTRATION_DRAFT } from "../types/marketplace"

interface SellerRegistrationStore {
  draft: SellerRegistrationDraft
  setSellerType: (type: SellerType) => void
  setVertical: (vertical: MarketplaceVertical) => void
  setShopField: <K extends keyof SellerRegistrationDraft>(field: K, value: SellerRegistrationDraft[K]) => void
  addPhoto: (photo: string) => void
  removePhoto: (index: number) => void
  addLegalDoc: (doc: { name: string; file: string }) => void
  removeLegalDoc: (index: number) => void
  goNext: () => void
  goPrev: () => void
  isStepValid: () => boolean
  reset: () => void
}

const stepOrder: RegistrationStep[] = ["seller_type", "shop_info", "verification"]

export const useSellerRegistrationStore = create<SellerRegistrationStore>()(
  persist(
    (set, get) => ({
      draft: { ...DEFAULT_REGISTRATION_DRAFT },

      setSellerType: (type) =>
        set((s) => ({ draft: { ...s.draft, sellerType: type } })),

      setVertical: (vertical) =>
        set((s) => ({ draft: { ...s.draft, vertical } })),

      setShopField: (field, value) =>
        set((s) => ({ draft: { ...s.draft, [field]: value } })),

      addPhoto: (photo) =>
        set((s) => ({ draft: { ...s.draft, photos: [...s.draft.photos, photo] } })),

      removePhoto: (index) =>
        set((s) => ({
          draft: { ...s.draft, photos: s.draft.photos.filter((_, i) => i !== index) },
        })),

      addLegalDoc: (doc) =>
        set((s) => ({ draft: { ...s.draft, legalDocs: [...s.draft.legalDocs, doc] } })),

      removeLegalDoc: (index) =>
        set((s) => ({
          draft: { ...s.draft, legalDocs: s.draft.legalDocs.filter((_, i) => i !== index) },
        })),

      goNext: () =>
        set((s) => {
          const idx = stepOrder.indexOf(s.draft.step)
          if (idx < stepOrder.length - 1) {
            return { draft: { ...s.draft, step: stepOrder[idx + 1] as RegistrationStep } }
          }
          return s
        }),

      goPrev: () =>
        set((s) => {
          const idx = stepOrder.indexOf(s.draft.step)
          if (idx > 0) {
            return { draft: { ...s.draft, step: stepOrder[idx - 1] as RegistrationStep } }
          }
          return s
        }),

      isStepValid: () => {
        const { draft } = get()
        switch (draft.step) {
          case "seller_type":
            return draft.sellerType !== null && draft.vertical !== null
          case "shop_info":
            if (draft.sellerType === "professional") {
              return draft.companyName.length >= 2 && draft.city.length >= 2 && draft.phone.length >= 8
            }
            if (draft.sellerType === "individual") {
              return draft.city.length >= 2 && draft.phone.length >= 8
            }
            return draft.companyName.length >= 2
          case "verification":
            if (draft.sellerType === "professional") {
              return draft.legalDocs.length > 0 || draft.idCard.length > 0
            }
            return true
          default:
            return false
        }
      },

      reset: () => set({ draft: { ...DEFAULT_REGISTRATION_DRAFT } }),
    }),
    { name: "seller-registration-draft" },
  ),
)
