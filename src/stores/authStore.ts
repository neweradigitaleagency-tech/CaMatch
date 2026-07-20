import { create } from "zustand";
import { supabase, isSupabaseReady } from "../services/supabase";
import { getAdminProfile } from "../services/admin/admin.service";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "../types";
import type { AdminUser } from "../types/admin";

interface AuthState {
  // User auth
  userId: string | null;
  role: UserRole;
  isPro: boolean;
  activeMode: "client" | "pro" | "supplier";
  availableModes: ("client" | "pro" | "supplier")[];
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  initialized: boolean;

  // Admin auth (merged)
  admin: AdminUser | null;
  permissions: string[];
  error: string | null;

  initialize: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<{ error: string | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setRole: (role: UserRole) => void;
  setUser: (userId: string, role?: UserRole) => void;
  setPro: () => void;
  setActiveMode: (mode: "client" | "pro" | "supplier") => void;
  setAvailableModes: (modes: ("client" | "pro" | "supplier")[]) => void;
  updateProfile: (data: { firstName?: string; lastName?: string; email?: string; phone?: string; avatarUrl?: string }) => void;
  logout: () => void;

  // Admin-specific
  adminLogin: (email: string, password: string) => Promise<{ error: string | null }>;
  adminDemoLogin: () => void;
  adminLogout: () => Promise<void>;
  hasPermission: (perm: string) => boolean;
  hasAnyPermission: (perms: string[]) => boolean;
  hasAllPermissions: (perms: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  role: "client",
  isPro: false,
  activeMode: "client",
  availableModes: ["client"],
  isAuthenticated: false,
  isLoading: true,
  user: null,
  initialized: false,

  admin: null,
  permissions: [],
  error: null,

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
            admin: null,
            permissions: [],
          });
        }
      });
    }
  },

  signInWithPhone: async (phone: string) => {
    if (!isSupabaseReady()) {
      set({ userId: "demo", role: "client", isAuthenticated: true });
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: true },
    });
    return { error: error?.message || null };
  },

  signInWithEmail: async (email: string, password: string) => {
    if (!isSupabaseReady()) {
      set({ userId: email, role: "client", isAuthenticated: true });
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  },

  signUpWithEmail: async (email: string, password: string) => {
    if (!isSupabaseReady()) {
      set({ userId: email, role: "client", isAuthenticated: true });
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message || null };
  },

  verifyOtp: async (phone: string, token: string) => {
    if (!isSupabaseReady()) {
      set({ userId: "demo", role: "client", isAuthenticated: true });
      return { error: null };
    }
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
      admin: null,
      permissions: [],
    });
  },

  setRole: (role) => set({ role }),
  setUser: (userId, role = "client") => set({ userId, role, isAuthenticated: true }),
  setPro: () => set({ isPro: true }),
  setActiveMode: (mode) => set({ activeMode: mode }),
  setAvailableModes: (modes) => set({ availableModes: modes }),
  updateProfile: (data) => {
    set((state) => {
      const current = state.user;
      if (!current) return state;
      const meta = { ...current.user_metadata, ...data };
      return {
        user: { ...current, user_metadata: meta } as User,
      };
    });
  },
  logout: async () => {
    await get().signOut();
  },

  // Admin-specific
  adminLogin: async (email: string, password: string) => {
    set({ error: null, isLoading: true });
    if (!isSupabaseReady()) {
      set({ isLoading: false, error: "Supabase non configuré" });
      return { error: "Supabase non configuré" };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        set({ isLoading: false, error: error?.message ?? "Identifiants incorrects" });
        return { error: error?.message ?? "Identifiants incorrects" };
      }
      const admin = await getAdminProfile();
      if (!admin) {
        await supabase.auth.signOut();
        set({ isLoading: false, error: "Accès non autorisé" });
        return { error: "Accès non autorisé — vous n'êtes pas administrateur" };
      }
      const permissions = admin.permissions;
      set({ admin, permissions, isAuthenticated: true, isLoading: false, error: null });
      await supabase.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", data.user.id);
      return { error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur de connexion";
      set({ isLoading: false, error: msg });
      return { error: msg };
    }
  },

  adminDemoLogin: () => {
    const demoAdmin: AdminUser = {
      id: "admin-demo",
      email: "admin@camatch.ci",
      firstname: "Admin",
      lastname: "Démo",
      status: "active",
      is_active: true,
      created_at: new Date().toISOString(),
      roles: [{ id: "role-admin", name: "Super Admin", permissions: { all: true }, is_system: true }],
      permissions: ["all"],
    };
    set({ admin: demoAdmin, permissions: ["all"], isAuthenticated: true, isLoading: false, error: null });
  },

  adminLogout: async () => {
    if (isSupabaseReady()) {
      await supabase.auth.signOut();
    }
    set({ admin: null, permissions: [], error: null });
  },

  hasPermission: (perm: string) => {
    const { permissions } = get();
    if (permissions.includes("all")) return true;
    return permissions.includes(perm);
  },

  hasAnyPermission: (perms: string[]) => {
    const { permissions } = get();
    if (permissions.includes("all")) return true;
    return perms.some((p) => permissions.includes(p));
  },

  hasAllPermissions: (perms: string[]) => {
    const { permissions } = get();
    if (permissions.includes("all")) return true;
    return perms.every((p) => permissions.includes(p));
  },
}));
