import { create } from "zustand";
import { supabase, isSupabaseReady } from "../services/supabase";
import type { User } from "@supabase/supabase-js";

export type UserRole = "client" | "pro";

interface AuthState {
  userId: string | null;
  role: UserRole;
  isPro: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<{ error: string | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setRole: (role: UserRole) => void;
  setUser: (userId: string, role?: UserRole) => void;
  setPro: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  role: "client",
  isPro: false,
  isAuthenticated: false,
  isLoading: true,
  user: null,
  initialized: false,

  initialize: async () => {
    if (!isSupabaseReady()) {
      set({ isLoading: false, initialized: true });
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({
          userId: session.user.id,
          user: session.user,
          role: "client",
          isPro: !!session.user.user_metadata?.isPro,
          isAuthenticated: true,
          isLoading: false,
          initialized: true,
        });
      } else {
        set({ isLoading: false, initialized: true });
      }
    } catch {
      set({ isLoading: false, initialized: true });
    }

    if (isSupabaseReady()) {
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          set({
            userId: session.user.id,
            user: session.user,
            role: "client",
            isPro: !!session.user.user_metadata?.isPro,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({
            userId: null,
            user: null,
            role: "client",
            isPro: false,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      });
    }
  },

  signInWithPhone: async (phone: string) => {
    if (!isSupabaseReady()) return { error: "Supabase non configuré" };
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: true },
    });
    return { error: error?.message || null };
  },

  signInWithEmail: async (email: string, password: string) => {
    if (!isSupabaseReady()) return { error: "Supabase non configuré" };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  },

  signUpWithEmail: async (email: string, password: string) => {
    if (!isSupabaseReady()) return { error: "Supabase non configuré" };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message || null };
  },

  verifyOtp: async (phone: string, token: string) => {
    if (!isSupabaseReady()) return { error: "Supabase non configuré" };
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
    return { error: error?.message || null };
  },

  signOut: async () => {
    if (isSupabaseReady()) {
      await supabase.auth.signOut();
    }
    set({
      userId: null,
      user: null,
      role: "client",
      isPro: false,
      isAuthenticated: false,
    });
  },

  setRole: (role) => set({ role }),
  setUser: (userId, role = "client") => set({ userId, role, isAuthenticated: true }),
  setPro: () => set({ isPro: true }),
  logout: async () => {
    await get().signOut();
  },
}));
