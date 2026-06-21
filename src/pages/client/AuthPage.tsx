import { useState, useRef, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, MessageCircle } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { supabase } from "../../services/supabase";

type AuthMode = "phone" | "email";
type PhoneStep = "phone-input" | "otp";

export default function AuthPage() {
  const nav = useNavigate();
  const signInWithPhone = useAuthStore((s) => s.signInWithPhone);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);
  const setUser = useAuthStore((s) => s.setUser);

  const [mode, setMode] = useState<AuthMode>("phone");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("phone-input");

  const [phone, setPhone] = useState("+225");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [emailMode, setEmailMode] = useState<"login" | "register">("login");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const emailRef = useRef<HTMLInputElement>(null);

  const goToClient = () => {
    setUser("demo", "client");
    nav("/", { replace: true });
  };

  useEffect(() => {
    if (mode === "email") emailRef.current?.focus();
  }, [mode, emailMode]);

  const handlePhoneSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (phone.length < 10) {
      setError("Numéro de téléphone invalide");
      return;
    }
    setLoading(true);
    const { error: err } = await signInWithPhone(phone);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setMessage("Code de vérification envoyé par SMS");
      setPhoneStep("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, key: string) => {
    if (key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Veuillez entrer le code à 6 chiffres");
      return;
    }
    setLoading(true);
    const { error: err } = await verifyOtp(phone, code);
    setLoading(false);
    if (err) {
      setError(err);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } else {
      goToClient();
    }
  };

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
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
      const session = await supabase.auth.getSession();
      const existingRole = session.data.session?.user?.user_metadata?.role;
      setUser(session.data.session?.user?.id || "demo", existingRole || "client");
      nav("/", { replace: true });
    } else {
      const { error: err } = await signUpWithEmail(email, password);
      if (err) {
        setError(err);
        setLoading(false);
        return;
      }
      goToClient();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#00A86B] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#00A86B]/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">Ça Match</h1>
          <p className="text-xs text-secondary mt-1">
            {mode === "phone"
              ? phoneStep === "phone-input"
                ? "Connectez-vous avec votre numéro"
                : "Entrez le code reçu par SMS"
              : "Connectez-vous avec votre email"}
          </p>
        </div>

        <div className="flex rounded-xl bg-pale-mint/50 p-1 mb-6">
          <button
            onClick={() => { setMode("phone"); setError(""); setMessage(""); setPhoneStep("phone-input"); }}
            className={`flex-1 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === "phone" ? "bg-white shadow-sm text-brand-forest" : "text-secondary/60 hover:text-secondary"
            }`}
          >
            <MessageCircle className="w-4 h-4" /> Téléphone
          </button>
          <button
            onClick={() => { setMode("email"); setError(""); setMessage(""); }}
            className={`flex-1 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === "email" ? "bg-white shadow-sm text-brand-forest" : "text-secondary/60 hover:text-secondary"
            }`}
          >
            <Mail className="w-4 h-4" /> Email
          </button>
        </div>

        {mode === "phone" ? (
          phoneStep === "phone-input" ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-secondary block mb-1.5">Numéro de téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+225 XX XX XX XX"
                    className="w-full h-12 pl-10 pr-4 bg-white rounded-xl border border-pale-mint text-sm placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                    autoComplete="tel"
                  />
                </div>
              </div>
              {error && <p className="text-xs text-[#EF4444] bg-[#EF4444]/5 rounded-lg px-3 py-2">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#00A86B] text-white font-bold text-sm rounded-xl hover:bg-[#007A4D] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Envoyer le code <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-secondary block mb-3 text-center">
                  Code envoyé au <span className="text-brand-forest">{phone}</span>
                </label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e.key)}
                      className="w-11 h-12 text-center text-lg font-bold bg-white rounded-xl border border-pale-mint focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                    />
                  ))}
                </div>
              </div>
              {message && <p className="text-xs text-[#00A86B] bg-[#00A86B]/5 rounded-lg px-3 py-2">{message}</p>}
              {error && <p className="text-xs text-[#EF4444] bg-[#EF4444]/5 rounded-lg px-3 py-2">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#00A86B] text-white font-bold text-sm rounded-xl hover:bg-[#007A4D] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Vérifier <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setPhoneStep("phone-input"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                className="w-full text-xs text-secondary/60 hover:text-secondary transition-colors cursor-pointer"
              >
                Changer de numéro
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-secondary block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full h-12 pl-10 pr-4 bg-white rounded-xl border border-pale-mint text-sm placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary block mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-10 pr-12 bg-white rounded-xl border border-pale-mint text-sm placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all"
                  autoComplete={emailMode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-secondary transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {message && <p className="text-xs text-[#00A86B] bg-[#00A86B]/5 rounded-lg px-3 py-2">{message}</p>}
            {error && <p className="text-xs text-[#EF4444] bg-[#EF4444]/5 rounded-lg px-3 py-2">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#00A86B] text-white font-bold text-sm rounded-xl hover:bg-[#007A4D] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {emailMode === "login" ? "Se connecter" : "Créer mon compte"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setEmailMode((m) => m === "login" ? "register" : "login"); setError(""); setMessage(""); }}
                className="text-xs text-[#00A86B] font-semibold hover:underline cursor-pointer"
              >
                {emailMode === "login" ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-[10px] text-secondary/40">
            En continuant, vous acceptez les{" "}
            <span className="underline cursor-pointer">Conditions d'utilisation</span>
          </p>
        </div>
      </div>

      <div className="px-6 pb-8">
        <button
          onClick={goToClient}
          className="w-full h-10 text-xs text-secondary/60 hover:text-secondary transition-colors cursor-pointer"
        >
          Mode démo — Continuer sans compte
        </button>
      </div>
    </div>
  );
}
