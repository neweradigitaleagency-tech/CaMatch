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
  login: (phone: string, role: "client" | "pro") => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_CLIENT: AuthUser = {
  id: "0195e7f8-3d78-7fd7-9acb-881faa4a225c",
  phone: "+2250101020304",
  role: "CLIENT",
  firstName: "Ahou",
  lastName: "Mireille",
  avatarUrl: null,
};

const DEMO_PRO: AuthUser = {
  id: "demo-pro-id",
  phone: "+2250102030501",
  role: "PROFESSIONAL",
  firstName: "Kouamé",
  lastName: "Yao",
  avatarUrl: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("ca_match_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("ca_match_user");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (phone: string, role: "client" | "pro"): Promise<boolean> => {
    // Simulate login — in production, this would use Supabase auth
    const demoUser = role === "client" ? DEMO_CLIENT : DEMO_PRO;
    const matchedUser = { ...demoUser, phone };
    setUser(matchedUser);
    localStorage.setItem("ca_match_user", JSON.stringify(matchedUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("ca_match_user");
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    if (newRole === "client") {
      setUser(DEMO_CLIENT);
      localStorage.setItem("ca_match_user", JSON.stringify(DEMO_CLIENT));
    } else if (newRole === "pro") {
      setUser(DEMO_PRO);
      localStorage.setItem("ca_match_user", JSON.stringify(DEMO_PRO));
    } else {
      setUser(null);
      localStorage.removeItem("ca_match_user");
    }
  }, []);

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
