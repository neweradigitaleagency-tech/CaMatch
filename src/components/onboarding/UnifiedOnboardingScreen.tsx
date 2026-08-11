import { useEffect, useRef, useState, type ComponentType } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ChevronLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Briefcase,
  Building2,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { isSupabaseReady } from "../../services/supabase";
import {
  PlumberIllustration,
  TrustIllustration,
  FastIllustration,
} from "./OnboardingIllustrations";

type AuthMode = "phone" | "email";
type Stage = "slides" | "auth";

interface Slide {
  id: string;
  Illustration: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    id: "welcome",
    Illustration: PlumberIllustration,
    title: "Bienvenue sur Ça Match",
    subtitle:
      "Trouvez le meilleur professionnel à Abidjan : plombiers, électriciens, climatisation, ménage et plus.",
  },
  {
    id: "trust",
    Illustration: TrustIllustration,
    title: "Achetez, vendez et commandez vos travaux avec confiance",
    subtitle:
      "Des pros vérifiés, un paiement sécurisé Mobile Money et une satisfaction garantie.",
  },
  {
    id: "fast",
    Illustration: FastIllustration,
    title: "Rapide et pas cher",
    subtitle:
      "Devis gratuit et tarifs justes. Comparez, choisissez, et c'est réglé en quelques minutes.",
  },
];

interface Props {
  onComplete: () => void;
  onDemoClient?: () => void;
  onDemoPro?: () => void;
  onDemoSupplier?: () => void;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.86-3.08.38-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.38C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

export default function UnifiedOnboardingScreen({ onComplete, onDemoClient, onDemoPro, onDemoSupplier }: Props) {
  const signInWithPhone = useAuthStore((s) => s.signInWithPhone);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signInWithApple = useAuthStore((s) => s.signInWithApple);

  const [stage, setStage] = useState<Stage>("slides");
  const [slideIndex, setSlideIndex] = useState(0);

  const [authMode, setAuthMode] = useState<AuthMode>("phone");
  const [emailMode, setEmailMode] = useState<"login" | "register">("register");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState("");

  const slide = SLIDES[slideIndex]!;

  /** Clôture l'authentification : en mode réel, l'état auth pilotera la navigation. */
  const finishAuth = () => {
    if (!isSupabaseReady()) {
      onComplete();
    }
  };

  const goToAuth = () => {
    setError("");
    setOtpSent(false);
    setOtp(["", "", "", "", "", ""]);
    setStage("auth");
  };

  const handlePhoneSubmit = async () => {
    setError("");
    if (phone.length < 8) {
      setError("Numéro invalide");
      return;
    }
    setLoading(true);
    const fullPhone = "+225" + phone;
    const { error: err } = await signInWithPhone(fullPhone);
    setLoading(false);
    if (err) setError(err);
    else setOtpSent(true);
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
        finishAuth();
      }
    }
  };

  const handleOtpKeyDown = (i: number, key: string) => {
    if (key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleEmailSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    if (password.length < 6) {
      setError("6 caractères minimum");
      return;
    }
    setLoading(true);
    if (emailMode === "login") {
      const { error: err } = await signInWithEmail(email, password);
      if (err) {
        setError(err);
        setLoading(false);
        return;
      }
    } else {
      const { error: err } = await signUpWithEmail(email, password);
      if (err) {
        setError(err);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    finishAuth();
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setError("");
    setProviderLoading(provider);
    const fn = provider === "google" ? signInWithGoogle : signInWithApple;
    const { error: err } = await fn();
    setProviderLoading(null);
    if (err) {
      setError(err);
      return;
    }
    if (!isSupabaseReady()) {
      finishAuth();
    }
  };

  // Auto-focus du premier champ OTP quand l'écran OTP s'affiche.
  useEffect(() => {
    if (stage === "auth" && authMode === "phone" && otpSent) {
      otpRefs.current[0]?.focus();
    }
  }, [stage, authMode, otpSent]);

  const nextSlide = () => {
    if (slideIndex < SLIDES.length - 1) {
      setSlideIndex((i) => i + 1);
    } else {
      goToAuth();
    }
  };

  const skipSlides = () => goToAuth();

  return (
    <div className="min-h-dynamic bg-cm-bg text-cm-text font-sans cm-viewport border-x border-cm-border shadow-2xl flex flex-col">

      <AnimatePresence mode="wait">
        {stage === "slides" ? (
          <motion.div
            key="slides"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            {/* Barre supérieure : Skip / Next */}
            <div className="flex items-center justify-between px-4 pt-3">
              <img src="/logo.svg" alt="Ça Match" className="h-7" />
              <div className="flex items-center gap-2">
                {slideIndex < SLIDES.length - 1 && (
                  <button
                    onClick={skipSlides}
                    className="text-[12px] font-semibold text-cm-text-muted px-3 py-2 rounded-[10px] cursor-pointer hover:text-cm-text hover:bg-cm-border/20 transition-colors"
                  >
                    Passer
                  </button>
                )}
                <button
                  onClick={nextSlide}
                  className={`flex items-center gap-1 h-9 px-3.5 rounded-[12px] text-[12px] font-bold transition-all active:scale-[0.96] cursor-pointer ${
                    slideIndex === SLIDES.length - 1
                      ? "bg-cm-accent text-cm-text-onAccent"
                      : "bg-cm-forest text-cm-text-onForest"
                  }`}
                >
                  {slideIndex === SLIDES.length - 1 ? "Commencer" : "Suivant"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Contenu du slide */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="w-[220px] h-[220px] sm:w-[240px] sm:h-[240px]">
                    <slide.Illustration className="w-full h-full drop-shadow-[0_10px_18px_rgba(36,51,24,0.14)]" />
                  </div>
                  <h1 className="mt-6 text-[22px] font-extrabold leading-tight tracking-tight max-w-[300px]">
                    {slide.title}
                  </h1>
                  <p className="mt-2.5 text-[13px] text-cm-text-soft leading-relaxed max-w-[290px]">
                    {slide.subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Points */}
            <div className="flex justify-center gap-1.5 pb-2">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setSlideIndex(i)}
                  aria-label={`Étape ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === slideIndex ? "w-6 bg-cm-accent" : "w-1.5 bg-cm-border"
                  }`}
                />
              ))}
            </div>

            {/* Mot démo (bas de slide) */}
            <div className="px-4 pb-5 pt-2">
              <button
                onClick={onDemoClient}
                className="w-full h-10 text-xs font-semibold text-cm-text-soft bg-cm-elevated rounded-xl border border-cm-border hover:bg-cm-surface transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-cm-text-muted" /> Mode démo Client
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            {/* Barre : retour + logo */}
            <div className="flex items-center gap-2 px-4 pt-3">
              <button
                onClick={() => setStage("slides")}
                aria-label="Retour"
                className="p-1.5 -ml-1.5 rounded-[10px] text-cm-text-soft cursor-pointer hover:bg-cm-border/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <img src="/logo.svg" alt="Ça Match" className="h-7" />
            </div>

            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
              <div className="text-center mb-6">
                <h1 className="text-[22px] font-extrabold tracking-tight">Connectez-vous</h1>
                <p className="text-xs text-cm-text-soft mt-1">
                  Numéro, email, Google ou Apple — comme vous voulez.
                </p>
              </div>

              <div className="flex rounded-xl bg-cm-accent-soft/50 p-1 mb-4">
                <button
                  onClick={() => {
                    setAuthMode("phone");
                    setError("");
                    setOtpSent(false);
                  }}
                  className={`flex-1 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === "phone"
                      ? "bg-cm-elevated shadow-sm text-cm-accent"
                      : "text-cm-text-soft/60 hover:text-cm-text-soft"
                  }`}
                >
                  <Mail className="w-4 h-4" /> Téléphone
                </button>
                <button
                  onClick={() => {
                    setAuthMode("email");
                    setError("");
                  }}
                  className={`flex-1 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === "email"
                      ? "bg-cm-elevated shadow-sm text-cm-accent"
                      : "text-cm-text-soft/60 hover:text-cm-text-soft"
                  }`}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
              </div>

              {authMode === "phone" ? (
                !otpSent ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-cm-text-soft block mb-1.5">
                        Numéro de téléphone
                      </label>
                      <div className="flex items-center gap-2 bg-cm-elevated p-1 rounded-xl border border-cm-border/30 focus-within:ring-2 focus-within:ring-cm-accent/30 focus-within:border-cm-accent transition-all">
                        <span className="text-sm font-bold px-3 py-2 bg-cm-accent-soft rounded-lg shrink-0">
                          +225
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          placeholder="XX XX XX XX"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                            setOtpSent(false);
                          }}
                          className="flex-1 text-sm outline-none bg-transparent"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handlePhoneSubmit}
                      disabled={phone.length < 8 || loading}
                      className="w-full h-12 bg-cm-accent text-cm-text-onAccent font-bold text-sm rounded-xl hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-cm-forest/30 border-t-cm-forest rounded-full animate-spin" />
                      ) : (
                        <>
                          Envoyer le code <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 text-center">
                    <h2 className="text-lg font-extrabold">Code de vérification</h2>
                    <p className="text-xs text-cm-text-soft">
                      Envoyé au <strong>+225 {phone}</strong>
                    </p>
                    <div className="flex justify-center gap-1.5 sm:gap-2 pt-2">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            otpRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e.key)}
                          className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-base sm:text-lg font-extrabold rounded-xl border outline-none transition-all ${
                            digit
                              ? "bg-cm-elevated border-cm-accent"
                              : "bg-cm-elevated border-cm-border/30"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setOtpSent(false);
                        setPhone("");
                        setError("");
                      }}
                      className="text-[12px] font-medium text-cm-accent cursor-pointer hover:underline"
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
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vous@exemple.com"
                        className="w-full h-12 pl-10 pr-4 bg-cm-elevated rounded-xl border border-cm-border text-sm outline-none focus:ring-2 focus:ring-cm-accent/30 focus:border-cm-accent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-cm-text-soft block mb-1.5">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-soft/60" />
                      <input
                        type={showPwd ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-12 pl-10 pr-12 bg-cm-elevated rounded-xl border border-cm-border text-sm outline-none focus:ring-2 focus:ring-cm-accent/30 focus:border-cm-accent transition-all"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
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
                    className="w-full h-12 bg-cm-accent text-cm-text-onAccent font-bold text-sm rounded-xl hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-cm-forest/30 border-t-cm-forest rounded-full animate-spin" />
                    ) : (
                      <>
                        {emailMode === "login" ? "Se connecter" : "Créer mon compte"}{" "}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <div className="text-center">
                    <button
                      onClick={() => {
                        setEmailMode((m) => (m === "login" ? "register" : "login"));
                        setError("");
                      }}
                      className="text-xs text-cm-accent font-semibold hover:underline cursor-pointer"
                    >
                      {emailMode === "login"
                        ? "Pas encore de compte ? S'inscrire"
                        : "Déjà un compte ? Se connecter"}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-xs text-cm-error bg-cm-error/5 rounded-lg px-3 py-2 mt-3">{error}</p>
              )}

              {/* Séparateur + OAuth */}
              <div className="flex items-center gap-3 my-5">
                <span className="flex-1 h-px bg-cm-border" />
                <span className="text-[11px] text-cm-text-muted">ou continuer avec</span>
                <span className="flex-1 h-px bg-cm-border" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOAuth("google")}
                  disabled={providerLoading !== null || loading}
                  className="h-12 rounded-xl bg-cm-elevated border border-cm-border font-semibold text-sm text-cm-text hover:bg-cm-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  {providerLoading === "google" ? (
                    <span className="w-5 h-5 border-2 border-cm-forest/30 border-t-cm-forest rounded-full animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  Gmail
                </button>
                <button
                  onClick={() => handleOAuth("apple")}
                  disabled={providerLoading !== null || loading}
                  className="h-12 rounded-xl bg-cm-forest border border-cm-forest font-semibold text-sm text-cm-text-onForest hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  {providerLoading === "apple" ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <AppleIcon />
                  )}
                  Apple
                </button>
              </div>

              <div className="text-center pt-4">
                <p className="text-[10px] text-cm-text-soft/40">
                  En continuant, vous acceptez les{" "}
                  <span className="underline cursor-pointer">Conditions d'utilisation</span> et la{" "}
                  <span className="underline cursor-pointer">Politique de confidentialité</span>.
                </p>
              </div>
            </div>

            {/* Mot démo (bas d'écran) */}
            <div className="px-4 pb-5 pt-2 space-y-2 border-t border-cm-border/30">
              <p className="text-[10px] text-cm-text-soft/40 text-center">Accès rapide — Mode démo</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={onDemoClient}
                  className="h-10 text-xs font-semibold text-cm-text bg-cm-elevated rounded-xl border border-cm-border hover:bg-cm-surface transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <User className="w-4 h-4 text-cm-text-muted" /> Client
                </button>
                <button
                  onClick={onDemoPro}
                  className="h-10 text-xs font-semibold text-cm-text bg-cm-elevated rounded-xl border border-cm-border hover:bg-cm-surface transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Briefcase className="w-4 h-4 text-cm-text-muted" /> Pro
                </button>
                <button
                  onClick={onDemoSupplier}
                  className="h-10 text-xs font-semibold text-cm-text bg-cm-elevated rounded-xl border border-cm-accent/30 hover:bg-cm-accent/5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Building2 className="w-4 h-4 text-cm-accent" /> Vendeur
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
