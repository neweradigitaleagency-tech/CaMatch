"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type UserRole = "visitor" | "client" | "pro";

export interface AuthUser {
  id: string;
  phone: string;
  role: "CLIENT" | "PROFESSIONAL";
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  loading: boolean;
  login: (role: "client" | "pro") => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/auth/dev-session");
        if (res.ok) {
          const data = await res.json();
          if (data.user) setUser(data.user as AuthUser);
        }
      } catch {
        // silent
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async (role: "client" | "pro"): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.user) setUser(data.user as AuthUser);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    document.cookie = "camatch_user=; path=/; max-age=0";
    setUser(null);
  }, []);

  const switchRole = useCallback(async (newRole: UserRole) => {
    if (newRole === "visitor") {
      logout();
      return;
    }
    if (!user) return;
    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role: newRole }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user as AuthUser);
      }
    } catch {
      // silent
    }
  }, [user, logout]);

  const role: UserRole = !user ? "visitor" : user.role === "CLIENT" ? "client" : "pro";

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useUser must be used within AuthProvider");
  return ctx;
}
