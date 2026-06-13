"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Briefcase, Loader2, Zap, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function DevLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<"client" | "pro" | null>(null);

  const handleDevLogin = async (role: "client" | "pro") => {
    setLoading(role);
    try {
      const res = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success(role === "pro" ? "Mode Pro activé" : "Mode Client activé");
      setTimeout(() => { window.location.href = "/"; }, 300);
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F4EE] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-orange to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-soft">
            <span className="text-white font-extrabold text-lg">Ç</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E] font-heading">Accès Démo</h1>
          <p className="text-[#1A1A2E]/60 mt-1 text-sm">
            Choisissez un mode pour explorer l&apos;application
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleDevLogin("client")}
            disabled={loading !== null}
            className="w-full bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-brand-orange/30 active:border-brand-orange transition-all text-left shadow-soft hover:shadow-card disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-text-primary">Client</p>
                <p className="text-xs text-text-secondary">Parcourir les pros, faire des demandes</p>
              </div>
              {loading === "client" && <Loader2 className="w-5 h-5 animate-spin text-brand-orange" />}
            </div>
          </button>

          <button
            onClick={() => handleDevLogin("pro")}
            disabled={loading !== null}
            className="w-full bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-brand-orange/30 active:border-brand-orange transition-all text-left shadow-soft hover:shadow-card disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-text-primary">Professionnel</p>
                <p className="text-xs text-text-secondary">Tableau de bord, opportunités, messagerie</p>
              </div>
              {loading === "pro" && <Loader2 className="w-5 h-5 animate-spin text-brand-orange" />}
            </div>
          </button>
        </div>

        <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-800">Mode Démo — Pas de connexion réelle</p>
              <p className="text-2xs text-amber-700 mt-0.5">
                Données de démonstration. Revenez plus tard pour la connexion par SMS.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Connexion normale
          </button>
        </div>
      </motion.div>
    </main>
  );
}
