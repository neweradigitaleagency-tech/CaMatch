"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

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
  login: (phone: string) => Promise<boolean>;
  verifyOtp: (phone: string, token: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  otpSent: boolean;
  setOtpSent: (v: boolean) => void;
  supabaseUser: User | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function syncUser(supabaseUser: User, desiredRole?: "client" | "pro"): Promise<AuthUser | null> {
  try {
    const res = await fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supabaseId: supabaseUser.id,
        phone: supabaseUser.phone || "",
        role: desiredRole || supabaseUser.user_metadata?.role || "client",
        firstName: supabaseUser.user_metadata?.firstName || "",
        lastName: supabaseUser.user_metadata?.lastName || "",
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSupabaseUser(session.user);
        const synced = await syncUser(session.user);
        if (synced) setUser(synced);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setSupabaseUser(session.user);
        const synced = await syncUser(session.user);
        if (synced) setUser(synced);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setSupabaseUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const login = useCallback(async (phone: string): Promise<boolean> => {
    try {
      const fullPhone = phone.startsWith("+") ? phone : `+225${phone}`;
      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
      if (error) {
        console.error("signInWithOtp error:", error);
        return false;
      }
      setOtpSent(true);
      return true;
    } catch (err) {
      console.error("signInWithOtp exception:", err);
      return false;
    }
  }, [supabase]);

  const verifyOtp = useCallback(async (phone: string, token: string): Promise<boolean> => {
    try {
      const fullPhone = phone.startsWith("+") ? phone : `+225${phone}`;
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token,
        type: "sms",
      });
      if (error) return false;
      return true;
    } catch {
      return false;
    }
  }, [supabase]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setOtpSent(false);
  }, [supabase]);

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
    <AuthContext.Provider value={{ user, role, loading, login, verifyOtp, logout, switchRole, otpSent, setOtpSent, supabaseUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useUser must be used within AuthProvider");
  return ctx;
}
