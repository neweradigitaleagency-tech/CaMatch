"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, Loader2, ChevronLeft, CheckCircle2, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "@/lib/auth-context";

type AuthMode = "phone" | "email";
type Step = "method" | "otp" | "role";

const ADMIN_PHONE = "0564148172";

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyOtp, adminLogin } = useUser();
  const [mode, setMode] = useState<AuthMode>("phone");
  const [step, setStep] = useState<Step>("method");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "pro">("client");
  const [sending, setSending] = useState(false);

  const isAdmin = useMemo(() => phone.replace(/\D/g, "") === ADMIN_PHONE, [phone]);

  const handleAdminLogin = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned !== ADMIN_PHONE) return;
    setSending(true);
    const ok = await adminLogin(cleaned, role);
    setSending(false);
    if (ok) {
      toast.success("Connecté !");
      setTimeout(() => { window.location.href = role === "pro" ? "/onboarding" : "/"; }, 400);
    } else {
      toast.error("Erreur de connexion");
    }
  };

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 8) {
      toast.error("Numéro invalide. Ex: 05 64 14 81 72");
      return;
    }
    setSending(true);
    const ok = await login(cleaned);
    setSending(false);
    if (ok) {
      setStep("otp");
      toast.success("Code envoyé par SMS !");
    } else {
      toast.error("Erreur d'envoi du code");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      toast.error("Entrez le code reçu par SMS");
      return;
    }
    setSending(true);
    const ok = await verifyOtp(phone, otp);
    setSending(false);
    if (ok) {
      setStep("role");
      toast.success("Connecté !");
      setTimeout(() => router.push(role === "pro" ? "/onboarding" : "/"), 400);
    } else {
      toast.error("Code invalide. Vérifiez et réessayez.");
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast.error("Remplissez tous les champs");
      return;
    }
    setSending(true);
    const fullPhone = phone ? (phone.startsWith("+") ? phone : `+225${phone}`) : "";
    const ok = await login(fullPhone || email);
    setSending(false);
    if (ok) {
      toast.success("Connecté !");
      setTimeout(() => router.push(role === "pro" ? "/onboarding" : "/"), 400);
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
          <h1 className="text-3xl font-bold text-[#1A1A2E] font-heading">Ça Match</h1>
          <p className="text-[#1A1A2E]/60 mt-2 text-sm">
            Le marché de confiance des services à Abidjan
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-soft p-6">
          <AnimatePresence mode="wait">
            {step === "method" && (
              <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-bold text-[#1A1A2E] mb-4">Connexion</h2>

                {/* Role Toggle */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <button
                    onClick={() => setRole("client")}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      role === "client"
                        ? "border-[#FF6B35] bg-[#FF6B35]/5 text-[#FF6B35]"
                        : "border-gray-100 text-text-secondary hover:border-gray-200"
                    }`}
                  >
                    <p className="text-xs font-bold">Client</p>
                    <p className="text-2xs opacity-70">Je cherche un pro</p>
                  </button>
                  <button
                    onClick={() => setRole("pro")}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      role === "pro"
                        ? "border-[#FF6B35] bg-[#FF6B35]/5 text-[#FF6B35]"
                        : "border-gray-100 text-text-secondary hover:border-gray-200"
                    }`}
                  >
                    <p className="text-xs font-bold">Prestataire</p>
                    <p className="text-2xs opacity-70">J&apos;offre un service</p>
                  </button>
                </div>

                {/* Auth Method Toggle */}
                <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
                  <button
                    onClick={() => setMode("phone")}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      mode === "phone" ? "bg-white text-[#FF6B35] shadow-sm" : "text-text-secondary"
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Téléphone
                  </button>
                  <button
                    onClick={() => setMode("email")}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      mode === "email" ? "bg-white text-[#FF6B35] shadow-sm" : "text-text-secondary"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </button>
                </div>

                {mode === "phone" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                        Numéro de téléphone
                      </label>
                      <div className="flex gap-2">
                        <span className="flex items-center px-3 bg-gray-100 rounded-xl text-sm font-medium text-text-secondary shrink-0">
                          +225
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="05 64 14 81 72"
                          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSendOtp}
                      disabled={sending || phone.length < 8}
                      className="w-full bg-[#FF6B35] text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2 shadow-cta"
                    >
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                      {sending ? "Envoi..." : "Recevoir le code"}
                    </button>
                    {isAdmin && (
                      <>
                        <div className="flex items-center gap-2 justify-center text-2xs text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">
                          <Zap className="w-3 h-3" />
                          Numéro administrateur détecté
                        </div>
                        <button
                          onClick={handleAdminLogin}
                          disabled={sending}
                          className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-600"
                        >
                          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                          {sending ? "Connexion..." : "Connexion Rapide (Admin)"}
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-text-secondary mb-1.5 block">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jean@example.com"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-secondary mb-1.5 block">Mot de passe</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                      />
                    </div>
                    <button
                      onClick={handleEmailAuth}
                      disabled={sending || !email || !password}
                      className="w-full bg-[#FF6B35] text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2 shadow-cta"
                    >
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                      {sending ? "Connexion..." : "Se connecter"}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setStep("method")} className="flex items-center gap-1 text-xs text-text-secondary mb-4">
                  <ChevronLeft className="w-4 h-4" />
                  Modifier le numéro
                </button>

                <h2 className="text-lg font-bold text-[#1A1A2E] mb-1">Code de vérification</h2>
                <p className="text-xs text-text-secondary mb-6">
                  Entrez le code reçu par SMS au <span className="font-semibold">+225 {phone}</span>
                </p>

                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="0 0 0 0 0 0"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-2xl text-center tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                  maxLength={6}
                />

                <button
                  onClick={handleVerifyOtp}
                  disabled={sending || otp.length < 4}
                  className="w-full bg-[#FF6B35] text-white font-bold py-3.5 rounded-xl mt-5 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2 shadow-cta"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {sending ? "Vérification..." : "Vérifier"}
                </button>

                <button onClick={handleSendOtp} disabled={sending} className="w-full text-xs text-[#FF6B35] font-medium mt-3">
                  Renvoyer le code
                </button>
              </motion.div>
            )}

            {step === "role" && (
              <motion.div key="role" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-[#1A1A2E] mb-1">Connecté !</h2>
                <p className="text-xs text-text-secondary mb-6">Redirection en cours...</p>
                <div className="flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF6B35]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-2xs text-text-secondary mt-4">
          En continuant, vous acceptez nos{" "}
          <span className="text-[#FF6B35] font-medium">Conditions d&apos;utilisation</span>
        </p>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => router.push("/dev-login")}
            className="w-full text-xs text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Accès démo sans SMS
          </button>
        </div>
      </motion.div>
    </div>
  );
}
