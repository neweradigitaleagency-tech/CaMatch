import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  RequestDraft, DiagnosticAnswer,
  MaterialsPreference, BudgetMode, AvailabilityMode,
} from "../types";
import { DEFAULT_DRAFT } from "../types";

const DRAFT_KEY = "cm_request_draft";

interface RequestWizardState {
  draft: RequestDraft;
  setStep: (step: number) => void;
  goNext: () => void;
  goPrev: () => void;
  setCategory: (category: string | null) => void;
  setSubCategory: (subCategory: string | null) => void;
  setDescription: (description: string) => void;
  setPhotos: (photos: string[]) => void;
  addPhotos: (photos: string[]) => void;
  removePhoto: (index: number) => void;
  setVideos: (videos: string[]) => void;
  setDiagnostic: (answers: DiagnosticAnswer[]) => void;
  setDiagnosticAnswer: (answer: DiagnosticAnswer) => void;
  setAddress: (address: string) => void;
  setAddressComplement: (complement: string) => void;
  setAccessInstructions: (instructions: string) => void;
  setCoordinates: (lat: number, lng: number) => void;
  setAvailability: (mode: AvailabilityMode) => void;
  setScheduledDate: (date: string) => void;
  setTimeSlot: (slot: string) => void;
  setBudgetMode: (mode: BudgetMode) => void;
  setBudgetMin: (min: number) => void;
  setBudgetMax: (max: number) => void;
  setMaterialsPreference: (pref: MaterialsPreference) => void;
  reset: () => void;
  isStepValid: (step: number) => boolean;
}

export const useRequestWizardStore = create<RequestWizardState>()(
  persist(
    (set, get) => ({
      draft: { ...DEFAULT_DRAFT },

      setStep: (step) => set((s) => ({ draft: { ...s.draft, step } })),
      goNext: () => set((s) => ({ draft: { ...s.draft, step: Math.min(s.draft.step + 1, 7) } })),
      goPrev: () => set((s) => ({ draft: { ...s.draft, step: Math.max(s.draft.step - 1, 1) } })),

      setCategory: (category) => set((s) => ({ draft: { ...s.draft, category, subCategory: null } })),
      setSubCategory: (subCategory) => set((s) => ({ draft: { ...s.draft, subCategory } })),
      setDescription: (description) => set((s) => ({ draft: { ...s.draft, description } })),
      setPhotos: (photos) => set((s) => ({ draft: { ...s.draft, photos } })),
      addPhotos: (photos) => set((s) => ({ draft: { ...s.draft, photos: [...s.draft.photos, ...photos] } })),
      removePhoto: (index) => set((s) => ({
        draft: { ...s.draft, photos: s.draft.photos.filter((_, i) => i !== index) },
      })),
      setVideos: (videos) => set((s) => ({ draft: { ...s.draft, videos } })),
      setDiagnostic: (answers) => set((s) => ({ draft: { ...s.draft, diagnostic: answers } })),
      setDiagnosticAnswer: (answer) => set((s) => {
        const existing = s.draft.diagnostic.findIndex((a) => a.questionId === answer.questionId);
        if (existing >= 0) {
          const updated = [...s.draft.diagnostic];
          updated[existing] = answer;
          return { draft: { ...s.draft, diagnostic: updated } };
        }
        return { draft: { ...s.draft, diagnostic: [...s.draft.diagnostic, answer] } };
      }),
      setAddress: (address) => set((s) => ({ draft: { ...s.draft, address } })),
      setAddressComplement: (complement) => set((s) => ({ draft: { ...s.draft, addressComplement: complement } })),
      setAccessInstructions: (instructions) => set((s) => ({ draft: { ...s.draft, accessInstructions: instructions } })),
      setCoordinates: (lat, lng) => set((s) => ({ draft: { ...s.draft, lat, lng } })),
      setAvailability: (mode) => set((s) => ({ draft: { ...s.draft, availability: mode } })),
      setScheduledDate: (date) => set((s) => ({ draft: { ...s.draft, scheduledDate: date } })),
      setTimeSlot: (slot) => set((s) => ({ draft: { ...s.draft, timeSlot: slot } })),
      setBudgetMode: (mode) => set((s) => ({ draft: { ...s.draft, budgetMode: mode } })),
      setBudgetMin: (min) => set((s) => ({ draft: { ...s.draft, budgetMin: min } })),
      setBudgetMax: (max) => set((s) => ({ draft: { ...s.draft, budgetMax: max } })),
      setMaterialsPreference: (pref) => set((s) => ({ draft: { ...s.draft, materialsPreference: pref } })),
      reset: () => set({ draft: { ...DEFAULT_DRAFT } }),

      isStepValid: (step) => {
        const d = get().draft;
        switch (step) {
          case 1: return !!d.category && !!d.subCategory;
          case 2: return d.description.length >= 10;
          case 3: return d.address.length >= 3;
          case 4: return !!d.availability;
          case 5: {
            if (!d.budgetMode) return false;
            if (d.budgetMode === "precise") return d.budgetMax > 0;
            if (d.budgetMode === "range") return d.budgetMin > 0 && d.budgetMax > d.budgetMin;
            return true;
          }
          case 6: return !!d.materialsPreference;
          case 7: return true;
          default: return false;
        }
      },
    }),
    { name: DRAFT_KEY },
  ),
);
