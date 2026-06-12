"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Phone, ChevronLeft, ShieldCheck, Loader2 } from "lucide-react";
import { useUser } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login: demoLogin } = useUser();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [role, setRole] = useState<"client" | "pro">("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async () => {
    setLoading(true);
    setError(null);
    // Demo: bypass OTP and go directly to verification
    const ok = await demoLogin(`+225${phone}`, role);
    if (ok) {
      router.push("/");
    } else {
      setError("Erreur de connexion");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    // In production, this would verify the OTP with Supabase
    const ok = await demoLogin(`+225${phone}`, role);
    if (ok) router.push("/");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col -mx-4 -mt-6 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      <div className="flex-1 flex flex-col justify-center px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 bg-brand-orange/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-brand-orange" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary mb-2">
            {step === "phone" ? "Bienvenue sur Ça Match" : "Code de vérification"}
          </h1>
          <p className="text-sm text-text-secondary">
            {step === "phone"
              ? "Entrez votre numéro pour commencer"
              : `Entrez le code envoyé au ${phone}`}
          </p>
        </motion.div>

        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-2xl px-4 py-3 mb-4">
            <p className="text-sm text-danger font-medium">{error}</p>
          </div>
        )}

        {step === "phone" ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
              <Phone className="w-5 h-5 text-text-tertiary" />
              <span className="text-text-secondary font-medium">+225</span>
              <div className="w-px h-6 bg-gray-200" />
              <input
                type="tel"
                placeholder="01 02 03 04 05"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="flex-1 bg-transparent outline-none text-text-primary text-lg"
                maxLength={10}
              />
            </div>
            <div className="flex gap-2">
              {["client", "pro"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r as typeof role)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${
                    role === r
                      ? "bg-brand-orange text-white border-brand-orange"
                      : "bg-white text-text-secondary border-gray-200"
                  }`}
                >
                  {r === "client" ? "Je suis Client" : "Je suis Pro"}
                </button>
              ))}
            </div>
            <button
              onClick={handleSendOTP}
              disabled={phone.length < 10 || loading}
              className="w-full bg-brand-orange text-white font-bold rounded-2xl py-4 text-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-cta flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? "Envoi..." : "Envoyer le code"}
            </button>
            <p className="text-xs text-text-tertiary text-center">
              En continuant, vous acceptez nos conditions d&apos;utilisation
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-2xl text-center text-2xl font-bold text-text-primary outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
                />
              ))}
            </div>
            <button
              onClick={handleVerifyOTP}
              disabled={otp.some((d) => !d) || loading}
              className="w-full bg-brand-orange text-white font-bold rounded-2xl py-4 text-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-cta flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? "Vérification..." : "Vérifier"}
            </button>
            <div className="text-center space-y-2">
              <button
                onClick={() => setStep("phone")}
                className="text-sm text-brand-orange font-medium flex items-center justify-center gap-1 mx-auto"
              >
                <ChevronLeft className="w-4 h-4" />
                Modifier le numéro
              </button>
              <p className="text-xs text-text-tertiary">
                Code non reçu ?{" "}
                <button onClick={handleSendOTP} className="text-brand-orange font-medium">
                  Renvoyer
                </button>
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
