"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Briefcase, Loader2, Zap, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useUser();
  const [loading, setLoading] = useState<"client" | "pro" | null>(null);

  const handleLogin = async (role: "client" | "pro") => {
    setLoading(role);
    const ok = await login(role);
    setLoading(null);
    if (ok) {
      toast.success(role === "pro" ? "Mode Professionnel activé" : "Mode Client activé");
      setTimeout(() => { window.location.href = role === "pro" ? "/dashboard" : "/"; }, 300);
    } else {
      toast.error("Erreur de connexion");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-brand-orange to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-soft">
            <span className="text-white font-extrabold text-xl">Ç</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E] font-heading">Bienvenue sur Ça Match</h1>
          <p className="text-[#1A1A2E]/60 mt-1 text-sm">
            Choisissez votre mode de connexion
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleLogin("client")}
            disabled={loading !== null}
            className="w-full bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-brand-orange/30 active:border-brand-orange transition-all text-left shadow-soft hover:shadow-card disabled:opacity-50 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-text-primary">Client</p>
                <p className="text-xs text-text-secondary">Parcourir les pros, faire des demandes de devis</p>
              </div>
              {loading === "client" ? (
                <Loader2 className="w-5 h-5 animate-spin text-brand-orange" />
              ) : (
                <ChevronRight className="w-5 h-5 text-text-tertiary group-hover:text-brand-orange transition-colors" />
              )}
            </div>
          </button>

          <button
            onClick={() => handleLogin("pro")}
            disabled={loading !== null}
            className="w-full bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-brand-orange/30 active:border-brand-orange transition-all text-left shadow-soft hover:shadow-card disabled:opacity-50 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-text-primary">Professionnel</p>
                <p className="text-xs text-text-secondary">Tableau de bord, opportunités, messagerie</p>
              </div>
              {loading === "pro" ? (
                <Loader2 className="w-5 h-5 animate-spin text-brand-orange" />
              ) : (
                <ChevronRight className="w-5 h-5 text-text-tertiary group-hover:text-brand-orange transition-colors" />
              )}
            </div>
          </button>
        </div>

        <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-800">Connexion administrateur locale</p>
              <p className="text-2xs text-amber-700 mt-0.5">
                Connexion instantanée sans SMS ni email. Données de démonstration préchargées.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-2xs text-text-secondary mt-6">
          En continuant, vous accédez à l&apos;application en mode démonstration
        </p>
      </motion.div>
    </div>
  );
}
