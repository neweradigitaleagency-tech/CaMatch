import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ArrowRight, Check, Sparkles, Crown,
  Smartphone, Mail, Lock, Eye, EyeOff, MessageCircle, Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

type AuthMode = "phone" | "email";

interface Props {
  onComplete: () => void;
  onSkip?: () => void;
}

export default function UnifiedOnboardingScreen({ onComplete, onSkip }: Props) {
  const nav = useNavigate();
  const signInWithPhone = useAuthStore((s) => s.signInWithPhone);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);

  const [authMode, setAuthMode] = useState<AuthMode>("phone");
  const [emailMode, setEmailMode] = useState<"login" | "register">("register");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [emailDone, setEmailDone] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // After success: show discover view, then optionally premium upsell
  const [step, setStep] = useState<"auth" | "discover" | "premium">("auth");

  const handlePhoneSubmit = async () => {
    setError("");
    if (phone.length < 8) { setError("Numéro invalide"); return; }
    setLoading(true);
    const fullPhone = "+225" + phone;
    const { error: err } = await signInWithPhone(fullPhone);
    setLoading(false);
    if (err) { setError(err); }
    else { setOtpSent(true); }
  };

  const handleOtpChange = async (i: number, val: string) => {
    if (val.length > 1) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
    if (newOtp.every((d) => d !== "")) {
      setLoading(true);
      setError("");
      const code = newOtp.join("");
      const fullPhone = "+225" + phone;
      const { error: err } = await verifyOtp(fullPhone, code);
      setLoading(false);
      if (err) {
        setError(err);
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      } else {
        setOtpVerified(true);
        setStep("discover");
      }
    }
  };

  const handleOtpKeyDown = (i: number, key: string) => {
    if (key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleEmailSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Veuillez remplir tous les champs"); return; }
    if (password.length < 6) { setError("6 caractères minimum"); return; }
    setLoading(true);
    if (emailMode === "login") {
      const { error: err } = await signInWithEmail(email, password);
      if (err) { setError(err); setLoading(false); return; }
    } else {
      const { error: err } = await signUpWithEmail(email, password);
      if (err) { setError(err); setLoading(false); return; }
    }
    setLoading(false);
    setEmailDone(true);
    setStep("discover");
  };

  const isAuthenticated = (authMode === "phone" && otpVerified) || (authMode === "email" && emailDone);

  return (
    <div className="min-h-dynamic bg-cm-bg flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
            step === "premium" ? "bg-amber-500 shadow-amber-500/20" : "bg-cm-accent shadow-cm-accent/20"
          }`}>
            {step === "premium" ? (
              <Crown className="w-8 h-8 text-white" />
            ) : (
              <Sparkles className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {step === "premium" ? "Passez à Premium" : "Ça Match"}
          </h1>
          <p className="text-xs text-cm-text-soft mt-1">
            {step === "auth" && "Connectez-vous pour commencer"}
            {step === "discover" && "Prêt à explorer"}
            {step === "premium" && "Débloquez toutes les fonctionnalités"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "auth" ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex rounded-xl bg-cm-accent-soft/50 p-1">
                <button
                  onClick={() => { setAuthMode("phone"); setError(""); setOtpSent(false); setOtpVerified(false); }}
                  className={`flex-1 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === "phone" ? "bg-white shadow-sm text-cm-accent" : "text-cm-text-soft/60 hover:text-cm-text-soft"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" /> Téléphone
                </button>
                <button
                  onClick={() => { setAuthMode("email"); setError(""); }}
                  className={`flex-1 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === "email" ? "bg-white shadow-sm text-cm-accent" : "text-cm-text-soft/60 hover:text-cm-text-soft"
                  }`}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
              </div>

              {authMode === "phone" ? (
                !otpSent ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-cm-text-soft block mb-1.5">Numéro de téléphone</label>
                      <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-cm-border/30">
                        <span className="text-sm font-bold px-3 py-2 bg-cm-accent-soft rounded-lg shrink-0">+225</span>
                        <input
                          type="tel" inputMode="numeric" placeholder="XX XX XX XX"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setOtpSent(false); setOtpVerified(false); }}
                          className="flex-1 text-sm outline-none bg-transparent"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handlePhoneSubmit}
                      disabled={phone.length < 8 || loading}
                      className="w-full h-12 bg-cm-accent text-white font-bold text-sm rounded-xl hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Envoyer le code <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 text-center">
                    <h2 className="text-xl font-extrabold">Code de vérification</h2>
                    <p className="text-xs text-cm-text-soft">
                      Envoyé au <strong>+225 {phone}</strong>
                    </p>
                    <div className="flex justify-center gap-2 pt-2">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el; }}
                          type="text" inputMode="numeric" maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e.key)}
                          className={`w-12 h-14 text-center text-lg font-extrabold rounded-xl border outline-none transition-all ${
                            digit ? "bg-white border-brand-forest" : "bg-white border-cm-border/30"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => { setOtpSent(false); setOtpVerified(false); setPhone(""); setError(""); }}
                      className="text-caption font-medium text-cm-accent cursor-pointer hover:underline"
                    >
                      Changer de numéro
                    </button>
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-cm-text-soft block mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-soft/60" />
                      <input
                        type="email" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vous@exemple.com"
                        className="w-full h-12 pl-10 pr-4 bg-white rounded-xl border border-cm-border text-sm outline-none focus:ring-2 focus:ring-cm-accent/30 focus:border-cm-accent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-cm-text-soft block mb-1.5">Mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-soft/60" />
                      <input
                        type={showPwd ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-12 pl-10 pr-12 bg-white rounded-xl border border-cm-border text-sm outline-none focus:ring-2 focus:ring-cm-accent/30 focus:border-cm-accent transition-all"
                      />
                      <button
                        type="button" tabIndex={-1}
                        onClick={() => setShowPwd((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cm-text-soft/60 cursor-pointer"
                      >
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleEmailSubmit}
                    disabled={loading}
                    className="w-full h-12 bg-cm-accent text-white font-bold text-sm rounded-xl hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>{emailMode === "login" ? "Se connecter" : "Créer mon compte"} <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                  <div className="text-center">
                    <button
                      onClick={() => { setEmailMode((m) => m === "login" ? "register" : "login"); setError(""); }}
                      className="text-xs text-cm-accent font-semibold hover:underline cursor-pointer"
                    >
                      {emailMode === "login" ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                    </button>
                  </div>
                </div>
              )}

              {error && <p className="text-xs text-cm-error bg-cm-error/5 rounded-lg px-3 py-2">{error}</p>}

              <div className="text-center pt-2">
                <p className="text-[10px] text-cm-text-soft/40">
                  En continuant, vous acceptez les{" "}
                  <span className="underline cursor-pointer">Conditions d'utilisation</span>
                </p>
              </div>
            </motion.div>
          ) : step === "discover" ? (
            <motion.div
              key="discover"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-4 pt-4"
            >
              <div className="w-16 h-16 rounded-full bg-cm-accent flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-extrabold">Connecté !</h2>
              <p className="text-xs text-cm-text-soft">Vous êtes prêt à découvrir les pros près de chez vous.</p>
              <button
                onClick={() => setStep("premium")}
                className="w-full h-12 bg-amber-500 text-white font-bold text-sm rounded-xl hover:brightness-105 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" /> Découvrir Premium
              </button>
              <button
                onClick={onComplete}
                className="w-full h-10 text-xs text-cm-text-soft/60 hover:text-cm-text-soft transition-colors cursor-pointer"
              >
                Continuer gratuitement
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="premium"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4 pt-2"
            >
              <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-gray-900">Ça Match Plus</p>
                    <p className="text-[11px] text-gray-500">Trouvez 2x plus rapidement</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {[
                    "Professionnels vérifiés en priorité",
                    "Matching IA avancé",
                    "Support prioritaire 24/7",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[12px] text-gray-700">
                      <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-baseline gap-1">
                  <span className="text-[24px] font-extrabold text-gray-900">4 900</span>
                  <span className="text-[12px] text-gray-500 font-medium">F/mois</span>
                </div>
              </div>

              <button
                onClick={() => nav("/subscription/plans")}
                className="w-full h-12 bg-amber-500 text-white font-bold text-sm rounded-xl hover:brightness-105 transition-all active:scale-[0.98] cursor-pointer"
              >
                Voir toutes les formules
              </button>
              <button
                onClick={onComplete}
                className="w-full h-10 text-xs text-cm-text-soft/60 hover:text-cm-text-soft transition-colors cursor-pointer"
              >
                Continuer gratuitement
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-6 pb-8">
        <button
          onClick={onSkip}
          className="w-full h-10 text-xs text-cm-text-soft/60 hover:text-cm-text-soft transition-colors cursor-pointer"
        >
          Mode démo — Continuer sans compte
        </button>
      </div>
    </div>
  );
}
