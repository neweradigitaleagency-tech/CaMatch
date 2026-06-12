"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/useAuth";

export function useSupabaseAuth() {
  const router = useRouter();
  const { login: setAuth, logout: clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOTP = async (phone: string) => {
    setLoading(true);
    setError(null);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone,
    });
    if (otpError) setError(otpError.message);
    setLoading(false);
    return !otpError;
  };

  const verifyOTP = async (phone: string, token: string, role?: string) => {
    setLoading(true);
    setError(null);
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
    if (verifyError || !data.user) {
      setError(verifyError?.message || "Code invalide");
      setLoading(false);
      return false;
    }
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, token, role }),
      });
      const body = await res.json();
      if (res.ok) {
        setAuth(phone);
        router.push("/");
        return true;
      }
      setError(body.error || "Erreur de création du compte");
      return false;
    } catch {
      setError("Erreur réseau");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearAuth();
    router.push("/login");
  };

  return { sendOTP, verifyOTP, signOut, loading, error };
}
