import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { MarketplaceVertical } from "../types/marketplace"
import { getSubcategoryById } from "../data/marketplaceCategories"

export type PublishStep = 0 | 1 | 2 | 3 | 4 | 5 | 6
export const STEP_COUNT = 7

export interface PublishListingDraft {
  step: PublishStep
  vertical: MarketplaceVertical | null
  categoryId: string
  title: string
  description: string
  brand: string
  model: string
  condition: string
  defects: string
  price: string
  originalPrice: string
  unit: string
  stock: string
  rental: boolean
  images: string[]
  deliveryAvailable: boolean
  deliveryFee: string
  location: string
}

export interface PublishedListing {
  id: string
  vertical: MarketplaceVertical
  categoryId: string
  categoryName: string
  title: string
  description: string
  brand: string
  model: string
  condition: string
  defects: string
  price: number
  originalPrice: number | null
  unit: string
  stock: number
  rental: boolean
  images: string[]
  deliveryAvailable: boolean
  deliveryFee: number | null
  location: string
  views: number
  status: "active" | "paused" | "sold"
  createdAt: string
}

export const DEFAULT_PUBLISH_DRAFT: PublishListingDraft = {
  step: 0,
  vertical: null,
  categoryId: "",
  title: "",
  description: "",
  brand: "",
  model: "",
  condition: "",
  defects: "",
  price: "",
  originalPrice: "",
  unit: "",
  stock: "",
  rental: false,
  images: [],
  deliveryAvailable: true,
  deliveryFee: "",
  location: "",
}

const CONDITION_OPTIONS: Record<string, string[]> = {
  pro_supply: ["new", "like_new"],
  shopping: ["new"],
  second_hand: ["like_new", "good", "fair"],
  real_estate: [],
  automobile: ["new", "like_new", "good", "fair"],
}

export const CONDITION_LABELS: Record<string, string> = {
  new: "Neuf",
  like_new: "Comme neuf",
  good: "Bon état",
  fair: "État correct",
}

export const UNIT_OPTIONS = ["piece", "meter", "kg", "liter", "bag", "box", "set"] as const
export const UNIT_LABELS: Record<string, string> = {
  piece: "Unité",
  meter: "Mètre",
  kg: "Kilogramme",
  liter: "Litre",
  bag: "Sac",
  box: "Boîte",
  set: "Lot",
}

export function getConditionOptions(vertical: MarketplaceVertical | null): string[] {
  return vertical ? CONDITION_OPTIONS[vertical] || [] : []
}

export function getConditionLabel(condition: string): string {
  return CONDITION_LABELS[condition] || condition
}

export function getUnitLabel(unit: string): string {
  return UNIT_LABELS[unit] || unit
}

export interface QualityCriterion {
  key: string
  label: string
  points: number
  earned: boolean
}

export function computeQualityScore(draft: PublishListingDraft): { score: number; criteria: QualityCriterion[] } {
  const num = (v: string) => (v.trim() === "" ? 0 : parseFloat(v.replace(/\s/g, "")))
  const criteria: QualityCriterion[] = [
    { key: "title", label: "Titre descriptif (10+ caractères)", points: 12, earned: draft.title.trim().length >= 10 },
    { key: "description", label: "Description détaillée (60+ caractères)", points: 16, earned: draft.description.trim().length >= 60 },
    { key: "category", label: "Sous-catégorie sélectionnée", points: 10, earned: draft.categoryId !== "" },
    { key: "brand", label: "Marque renseignée", points: 4, earned: draft.brand.trim() !== "" },
    { key: "model", label: "Modèle / référence renseigné", points: 4, earned: draft.model.trim() !== "" },
    { key: "condition", label: "État renseigné", points: 6, earned: draft.vertical === "real_estate" || draft.condition !== "" },
    { key: "price", label: "Prix fixé", points: 14, earned: num(draft.price) > 0 },
    { key: "unit", label: "Unité de vente définie", points: 6, earned: draft.vertical !== "pro_supply" || draft.unit !== "" },
    { key: "stock", label: "Stock disponible", points: 6, earned: num(draft.stock) > 0 },
    { key: "images", label: draft.images.length >= 3 ? "3 photos ou plus" : "Au moins 1 photo", points: 14, earned: draft.images.length >= 3 ? true : draft.images.length >= 1 },
    { key: "delivery", label: "Options de livraison définies", points: 6, earned: draft.deliveryAvailable ? draft.deliveryFee.trim() !== "" : true },
    { key: "location", label: "Localisation du vendeur", points: 4, earned: draft.location.trim().length >= 2 },
  ]

  const score = Math.min(100, criteria.reduce((sum, c) => sum + (c.earned ? c.points : 0), 0))
  return { score, criteria }
}

export function getScoreTier(score: number): { label: string; description: string; color: string } {
  if (score >= 80) {
    return {
      label: "Excellent",
      description: "Votre annonce est prête. Elle gagnera en visibilité dans le marché.",
      color: "#16a34a",
    }
  }
  if (score >= 60) {
    return {
      label: "Bon",
      description: "Quelques améliorations augmenteront vos chances de vendre vite.",
      color: "#d97706",
    }
  }
  return {
    label: "À compléter",
    description: "Complétez les points ci-dessous pour maximiser vos ventes.",
    color: "#dc2626",
  }
}

export const formatPrice = (v: string | number): string => {
  const n = typeof v === "string" ? parseFloat(v.replace(/\s/g, "")) : v
  if (!Number.isFinite(n)) return ""
  return n.toLocaleString("fr-FR")
}

function computeViews(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997
  return 40 + h
}

function createListingId(): string {
  return `user-${Date.now().toString(36)}`
}

interface PublishListingStore {
  listings: PublishedListing[]
  draft: PublishListingDraft
  setVertical: (vertical: MarketplaceVertical) => void
  setCategory: (categoryId: string) => void
  setField: <K extends keyof PublishListingDraft>(field: K, value: PublishListingDraft[K]) => void
  addImage: (url: string) => void
  removeImage: (index: number) => void
  goNext: () => void
  goPrev: () => void
  setStep: (step: PublishStep) => void
  isStepValid: () => boolean
  isPublishable: () => boolean
  publish: () => PublishedListing
  toggleListingStatus: (id: string) => void
  removeListing: (id: string) => void
  resetDraft: () => void
}

export const usePublishListingStore = create<PublishListingStore>()(
  persist(
    (set, get) => ({
      listings: [],
      draft: { ...DEFAULT_PUBLISH_DRAFT },

      setVertical: (vertical) =>
        set((s) => ({
          draft: {
            ...s.draft,
            vertical,
            categoryId: "",
            condition: vertical === "shopping" ? "new" : s.draft.condition,
          },
        })),

      setCategory: (categoryId) =>
        set((s) => ({ draft: { ...s.draft, categoryId } })),

      setField: (field, value) =>
        set((s) => ({ draft: { ...s.draft, [field]: value } })),

      addImage: (url) =>
        set((s) => {
          const trimmed = url.trim()
          if (!trimmed) return s
          if (s.draft.images.includes(trimmed)) return s
          return { draft: { ...s.draft, images: [...s.draft.images, trimmed].slice(0, 8) } }
        }),

      removeImage: (index) =>
        set((s) => ({
          draft: { ...s.draft, images: s.draft.images.filter((_, i) => i !== index) },
        })),

      goNext: () =>
        set((s) => {
          if (s.draft.step < STEP_COUNT - 1) {
            return { draft: { ...s.draft, step: (s.draft.step + 1) as PublishStep } }
          }
          return s
        }),

      goPrev: () =>
        set((s) => {
          if (s.draft.step > 0) {
            return { draft: { ...s.draft, step: (s.draft.step - 1) as PublishStep } }
          }
          return s
        }),

      setStep: (step) => set((s) => ({ draft: { ...s.draft, step } })),

      isStepValid: () => {
        const { draft } = get()
        const num = (v: string) => (v.trim() === "" ? 0 : parseFloat(v.replace(/\s/g, "")))
        switch (draft.step) {
          case 0:
            return draft.vertical !== null
          case 1:
            return draft.categoryId !== ""
          case 2:
            return draft.title.trim().length >= 4 && draft.description.trim().length >= 10
          case 3:
            return draft.vertical === "real_estate" || draft.condition !== ""
          case 4:
            return num(draft.price) > 0 && num(draft.stock) > 0
          case 5:
            return draft.images.length >= 1
          case 6:
            return draft.location.trim().length >= 2 && (!draft.deliveryAvailable || draft.deliveryFee.trim() !== "")
          default:
            return false
        }
      },

      isPublishable: () => {
        const { draft } = get()
        const num = (v: string) => (v.trim() === "" ? 0 : parseFloat(v.replace(/\s/g, "")))
        return (
          draft.vertical !== null &&
          draft.categoryId !== "" &&
          draft.title.trim().length >= 4 &&
          draft.description.trim().length >= 10 &&
          (draft.vertical === "real_estate" || draft.condition !== "") &&
          num(draft.price) > 0 &&
          num(draft.stock) > 0 &&
          draft.images.length >= 1 &&
          draft.location.trim().length >= 2 &&
          (!draft.deliveryAvailable || draft.deliveryFee.trim() !== "")
        )
      },

      publish: () => {
        const { draft } = get()
        const num = (v: string) => (v.trim() === "" ? 0 : parseFloat(v.replace(/\s/g, "")))
        const category = draft.categoryId ? getSubcategoryById(draft.categoryId) : undefined
        const id = createListingId()
        const listing: PublishedListing = {
          id,
          vertical: draft.vertical || "shopping",
          categoryId: draft.categoryId,
          categoryName: category?.sub.name || draft.categoryId,
          title: draft.title.trim(),
          description: draft.description.trim(),
          brand: draft.brand.trim(),
          model: draft.model.trim(),
          condition: draft.condition,
          defects: draft.defects.trim(),
          price: num(draft.price),
          originalPrice: num(draft.originalPrice) > 0 ? num(draft.originalPrice) : null,
          unit: draft.unit || "piece",
          stock: Math.round(num(draft.stock)),
          rental: draft.rental,
          images: draft.images,
          deliveryAvailable: draft.deliveryAvailable,
          deliveryFee: draft.deliveryAvailable && num(draft.deliveryFee) > 0 ? num(draft.deliveryFee) : null,
          location: draft.location.trim(),
          views: computeViews(id),
          status: "active",
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ listings: [listing, ...s.listings], draft: { ...DEFAULT_PUBLISH_DRAFT } }))
        return listing
      },

      toggleListingStatus: (id) =>
        set((s) => ({
          listings: s.listings.map((l) =>
            l.id === id ? { ...l, status: l.status === "active" ? "paused" : "active" } : l,
          ),
        })),

      removeListing: (id) =>
        set((s) => ({ listings: s.listings.filter((l) => l.id !== id) })),

      resetDraft: () => set({ draft: { ...DEFAULT_PUBLISH_DRAFT } }),
    }),
    { name: "marketplace-publish-listing" },
  ),
)
