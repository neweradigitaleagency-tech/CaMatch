import { create } from "zustand";
import type { ProOnboardingData, ProApplicationStatus, PaymentMethod } from "../types";

const STORAGE_KEY = "cm_pro_onboarding";

function loadDraft(): ProOnboardingData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(data: ProOnboardingData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

const defaultData: ProOnboardingData = {
  currentStep: 0,
  maxCompletedStep: 0,
  status: "NOT_STARTED",

  selectedCategoryIds: [],
  selectedSubCategories: [],

  location: { lat: 5.36, lng: -4.008 },
  serviceRadiusKm: 10,

  title: "",
  bio: "",
  experienceYears: 1,
  hourlyRateXOF: 5000,
  travelFeeXOF: 2000,

  documents: [],

  portfolioItems: [],

  phone: "",
  phoneVerified: false,
  email: "",
  emailVerified: false,

  paymentMethod: null,
  paymentPhone: "",

  cguAccepted: false,
  signature: null,

  submittedAt: null,
  reviewedAt: null,
  reviewNotes: null,
};

interface ProOnboardingStore extends ProOnboardingData {
  initialized: boolean;
  initialize: () => void;
  setStep: (step: number) => void;
  updateField: <K extends keyof ProOnboardingData>(key: K, value: ProOnboardingData[K]) => void;
  save: () => void;
  submit: () => void;
  reset: () => void;
}

export const useProOnboardingStore = create<ProOnboardingStore>((set, get) => ({
  ...defaultData,
  initialized: false,

  initialize: () => {
    const saved = loadDraft();
    if (saved) {
      set({ ...saved, initialized: true });
    } else {
      set({ initialized: true });
    }
  },

  setStep: (step: number) => {
    const state = get();
    const newMax = Math.max(state.maxCompletedStep, step);
    const newData = { ...state, currentStep: step, maxCompletedStep: newMax };
    if (step > state.currentStep) {
      saveDraft(newData);
    }
    set(newData);
  },

  updateField: (key, value) => {
    const state = get();
    const newData = { ...state, [key]: value };
    saveDraft(newData);
    set(newData);
  },

  save: () => {
    saveDraft(get());
  },

  submit: () => {
    const state = get();
    const now = new Date().toISOString();
    const newData = {
      ...state,
      status: "SUBMITTED" as ProApplicationStatus,
      submittedAt: now,
      currentStep: ONBOARDING_STEP_INDEX_MAP.pending!,
      maxCompletedStep: ONBOARDING_STEP_INDEX_MAP.pending!,
    };
    saveDraft(newData);
    set(newData);
  },

  reset: () => {
    clearDraft();
    set({ ...defaultData, initialized: true });
  },
}));

const ONBOARDING_STEP_INDEX_MAP: Record<string, number> = {
  welcome: 0, eligibility: 1, categories: 2, location: 3, info: 4,
  documents: 5, portfolio: 6, "otp-phone": 7, "otp-email": 8,
  payment: 9, cgu: 10, review: 11, pending: 12,
};
