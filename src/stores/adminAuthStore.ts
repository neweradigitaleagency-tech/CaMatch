import { create } from "zustand"
import { supabase, isSupabaseReady } from "../services/supabase"
import { getAdminProfile } from "../services/admin/admin.service"
import type { AdminUser } from "../types/admin"

interface AdminAuthState {
  admin: AdminUser | null
  permissions: string[]
  isAuthenticated: boolean
  isLoading: boolean
  initialized: boolean
  error: string | null
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  hasPermission: (perm: string) => boolean
  hasAnyPermission: (perms: string[]) => boolean
  hasAllPermissions: (perms: string[]) => boolean
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  admin: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: true,
  initialized: false,
  error: null,

  initialize: async () => {
    if (!isSupabaseReady()) {
      set({ isLoading: false, initialized: true })
      return
    }
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const admin = await getAdminProfile()
        if (admin) {
          const permissions = admin.permissions
          set({
            admin,
            permissions,
            isAuthenticated: true,
            isLoading: false,
            initialized: true,
          })
          return
        }
      }
    } catch {
      /* not authenticated */
    }
    set({ isLoading: false, initialized: true })
  },

  login: async (email: string, password: string) => {
    set({ error: null, isLoading: true })
    if (!isSupabaseReady()) {
      set({ isLoading: false, error: "Supabase non configuré" })
      return { error: "Supabase non configuré" }
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) {
        set({ isLoading: false, error: error?.message ?? "Identifiants incorrects" })
        return { error: error?.message ?? "Identifiants incorrects" }
      }
      const admin = await getAdminProfile()
      if (!admin) {
        await supabase.auth.signOut()
        set({ isLoading: false, error: "Accès non autorisé" })
        return { error: "Accès non autorisé — vous n'êtes pas administrateur" }
      }
      const permissions = admin.permissions
      set({ admin, permissions, isAuthenticated: true, isLoading: false, error: null })
      await supabase.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", data.user.id)
      return { error: null }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur de connexion"
      set({ isLoading: false, error: msg })
      return { error: msg }
    }
  },

  logout: async () => {
    if (isSupabaseReady()) {
      await supabase.auth.signOut()
    }
    set({ admin: null, permissions: [], isAuthenticated: false, error: null })
  },

  hasPermission: (perm: string) => {
    const { permissions } = get()
    if (permissions.includes("all")) return true
    return permissions.includes(perm)
  },

  hasAnyPermission: (perms: string[]) => {
    const { permissions } = get()
    if (permissions.includes("all")) return true
    return perms.some((p) => permissions.includes(p))
  },

  hasAllPermissions: (perms: string[]) => {
    const { permissions } = get()
    if (permissions.includes("all")) return true
    return perms.every((p) => permissions.includes(p))
  },
}))
