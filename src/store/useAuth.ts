import { create } from "zustand";

type UserRole = "CLIENT" | "PROFESSIONAL" | null;

interface AuthState {
  isAuthenticated: boolean;
  phone: string | null;
  role: UserRole;
  trustScore: number;
  badge: string;
  setPhone: (phone: string) => void;
  setRole: (role: UserRole) => void;
  setTrustScore: (score: number) => void;
  setBadge: (badge: string) => void;
  login: (phone: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  phone: null,
  role: null,
  trustScore: 0,
  badge: "NONE",
  setPhone: (phone) => set({ phone }),
  setRole: (role) => set({ role }),
  setTrustScore: (score) => set({ trustScore: score }),
  setBadge: (badge) => set({ badge }),
  login: (phone) => set({ isAuthenticated: true, phone }),
  logout: () =>
    set({
      isAuthenticated: false,
      phone: null,
      role: null,
      trustScore: 0,
      badge: "NONE",
    }),
}));
