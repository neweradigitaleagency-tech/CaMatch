import { useState, useRef, type ComponentType } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, Check, Camera, MapPin, Smartphone,
  UserIcon, Sparkles, Shield, Globe, MessageSquare, Star, Bell,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";

interface ClientOnboardingData {
  firstName: string;
  lastName: string;
  phone: string;
  language: "fr" | "nouchi" | "en";
  commune: string;
  avatarLocalUrl?: string;
}

interface Props {
  onComplete: (data: ClientOnboardingData) => void;
  onSkip?: () => void;
}

const COMMUNES = [
  "Cocody", "Plateau", "Marcory", "Treichville", "Adjamé",
  "Yopougon", "Abobo", "Koumassi", "Port-Bouët", "Bingerville",
  "Anyama", "Attécoubé", "Williamsville",
];

const LANGUAGES = [
  { id: "fr" as const, label: "Français", desc: "Langue officielle" },
  { id: "nouchi" as const, label: "Nouchi", desc: "Parlé à Abidjan" },
  { id: "en" as const, label: "English", desc: "International" },
];

const STEPS = [
  { key: "welcome", label: "Bienvenue" },
  { key: "language", label: "Langue" },
  { key: "phone", label: "Téléphone" },
  { key: "otp", label: "Code" },
  { key: "profile", label: "Profil" },
  { key: "location", label: "Localisation" },
];

export default function ClientOnboardingScreen({ onComplete, onSkip }: Props) {
  const signInWithPhone = useAuthStore((s) => s.signInWithPhone);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);

  const [data, setData] = useState<ClientOnboardingData>({
    firstName: "", lastName: "", phone: "", language: "fr",
    commune: "Cocody",
  });
  const [step, setStep] = useState(0);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const progress = ((step + 1) / STEPS.length) * 100;
  const isLast = step === STEPS.length - 1;

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };
  const prev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const canProceed = () => {
    switch (STEPS[step].key) {
      case "phone": return data.phone.length >= 8 && !loading;
      case "otp": return otpVerified;
      case "profile": return data.firstName.length >= 1 && data.lastName.length >= 1;
      case "location": return !!data.commune;
      default: return true;
    }
  };

  const handleSendOtp = async () => {
    setError("");
    setLoading(true);
    const phone = "+225" + data.phone;
    const { error: err } = await signInWithPhone(phone);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setOtpSent(true);
      next();
    }
  };

  const handleOtpChange = async (i: number, val: string) => {
    if (val.length > 1) return;
    const newOtp = [...otpCode];
    newOtp[i] = val;
    setOtpCode(newOtp);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
    if (newOtp.every((d) => d !== "")) {
      setLoading(true);
      setError("");
      const code = newOtp.join("");
      const phone = "+225" + data.phone;
      const { error: err } = await verifyOtp(phone, code);
      setLoading(false);
      if (err) {
        setError(err);
        setOtpCode(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      } else {
        setOtpVerified(true);
      }
    }
  };

  const handleComplete = () => {
    onComplete({ ...data, avatarLocalUrl: photoPreview || undefined });
  };

  const inputClass = "w-full h-11 text-sm bg-white rounded-xl px-4 outline-none focus:ring-1 focus:ring-brand-lime border border-pale-mint/30";

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      {/* Progress Bar */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between mb-2">
          <button onClick={step > 0 ? prev : onSkip} className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer">
            <ChevronLeft className="w-5 h-5 text-brand-forest" />
          </button>
          <span className="text-caption font-medium text-secondary">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-pale-mint rounded-full overflow-hidden">
          <div className="h-full bg-cm-green rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-caption text-secondary mt-2 font-medium uppercase tracking-wider">
          {STEPS[step]?.label}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-5"
          >
            {/* Welcome */}
            {STEPS[step].key === "welcome" && (
              <div className="flex flex-col items-center pt-8 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-cm-green flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-extrabold">Bienvenue sur Ça Match</h1>
                <p className="text-sm text-secondary max-w-xs leading-relaxed">
                  Trouvez le professionnel idéal pour tous vos travaux à Abidjan. En quelques clics.
                </p>
                <div className="space-y-2 w-full pt-4">
                  <BenefitTile icon={Star} text="Pros vérifiés et notés par la communauté" />
                  <BenefitTile icon={MessageSquare} text="Devis instantané par IA ou messagerie" />
                  <BenefitTile icon={Shield} text="Paiement sécurisé via Mobile Money" />
                  <BenefitTile icon={Bell} text="Suivi en temps réel de votre mission" />
                </div>
              </div>
            )}

            {/* Language */}
            {STEPS[step].key === "language" && (
              <div className="pt-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cm-green/20 flex items-center justify-center">
                  <Globe className="w-7 h-7 text-cm-green" />
                </div>
                <h2 className="text-xl font-extrabold">Votre langue</h2>
                <p className="text-xs text-secondary">Choisissez votre langue préférée pour l'application.</p>
                <div className="space-y-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setData((d) => ({ ...d, language: lang.id }))}
                      className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        data.language === lang.id
                          ? "bg-cm-green/10 border-cm-green"
                          : "bg-white border-pale-mint/30 hover:border-pale-mint/60"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                        data.language === lang.id ? "bg-cm-green text-white" : "bg-pale-mint"
                      }`}>
                        {lang.id === "fr" ? "FR" : lang.id === "nouchi" ? "NOU" : "EN"}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{lang.label}</p>
                        <p className="text-caption text-secondary">{lang.desc}</p>
                      </div>
                      {data.language === lang.id && <Check className="w-5 h-5 text-cm-green ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Phone */}
            {STEPS[step].key === "phone" && (
              <div className="pt-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cm-green/20 flex items-center justify-center">
                  <Smartphone className="w-7 h-7 text-cm-green" />
                </div>
                <h2 className="text-xl font-extrabold">Votre numéro</h2>
                <p className="text-xs text-secondary">
                  Saisissez votre numéro de téléphone. Un code de vérification vous sera envoyé par SMS.
                </p>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-pale-mint/30">
                  <span className="text-sm font-bold px-3 py-2 bg-pale-mint rounded-lg">+225</span>
                  <input
                    type="tel" inputMode="numeric" placeholder="XX XX XX XX"
                    value={data.phone}
                    onChange={(e) => {
                      setData((d) => ({ ...d, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }));
                      setOtpSent(false);
                      setOtpVerified(false);
                      setOtpCode(["", "", "", "", "", ""]);
                    }}
                    className="flex-1 text-sm outline-none bg-transparent"
                  />
                </div>
                {error && <p className="text-xs text-[#EF4444] bg-[#EF4444]/5 rounded-lg px-3 py-2">{error}</p>}
                {data.phone.length >= 8 && !otpSent && (
                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full py-4 bg-cm-green text-white font-bold text-sm rounded-2xl hover:brightness-105 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                    ) : (
                      "Envoyer le code"
                    )}
                  </button>
                )}
              </div>
            )}

            {/* OTP */}
            {STEPS[step].key === "otp" && (
              <div className="pt-6 space-y-4 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                  loading ? "animate-pulse bg-orange/20" : otpVerified ? "bg-cm-green" : "bg-cm-green/20"
                }`}>
                  {loading ? (
                    <span className="w-6 h-6 border-2 border-cm-green/30 border-t-cm-green rounded-full animate-spin" />
                  ) : otpVerified ? (
                    <Check className="w-8 h-8 text-white" />
                  ) : (
                    <Smartphone className="w-8 h-8 text-cm-green" />
                  )}
                </div>
                <h2 className="text-xl font-extrabold">Code de vérification</h2>
                <p className="text-xs text-secondary">
                  Un code à 6 chiffres a été envoyé au <strong>+225 {data.phone}</strong>
                </p>
                {error && <p className="text-xs text-[#EF4444] bg-[#EF4444]/5 rounded-lg px-3 py-2">{error}</p>}
                <div className="flex justify-center gap-2 pt-2">
                  {otpCode.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !digit && i > 0) {
                          otpRefs.current[i - 1]?.focus();
                        }
                      }}
                      className={`w-12 h-14 text-center text-lg font-extrabold rounded-xl border outline-none transition-all ${
                        otpVerified
                          ? "bg-cm-green/10 border-cm-green text-cm-green"
                          : digit
                            ? "bg-white border-brand-forest"
                            : "bg-white border-pale-mint/30"
                      }`}
                    />
                  ))}
                </div>
                {otpVerified && (
                  <div className="bg-cm-green/10 p-3 rounded-xl">
                    <p className="text-xs font-bold text-cm-green">✓ Numéro vérifié avec succès</p>
                  </div>
                )}
                <button className="text-caption font-medium text-cm-green cursor-pointer hover:underline">
                  Renvoyer le code
                </button>
              </div>
            )}

            {/* Profile */}
            {STEPS[step].key === "profile" && (
              <div className="pt-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cm-green/20 flex items-center justify-center">
                  <UserIcon className="w-7 h-7 text-cm-green" />
                </div>
                <h2 className="text-xl font-extrabold">Votre profil</h2>
                <p className="text-xs text-secondary">Comment les professionnels vous reconnaîtront.</p>

                {/* Photo */}
                <div className="flex justify-center">
                  <div
                    onClick={() => photoRef.current?.click()}
                    className="cursor-pointer"
                  >
                    {photoPreview ? (
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-cm-green">
                        <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-pale-mint border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-cm-green transition-colors">
                        <Camera className="w-7 h-7 text-secondary/60" />
                      </div>
                    )}
                  </div>
                  <input ref={photoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { const r = new FileReader(); r.onload = () => setPhotoPreview(r.result as string); r.readAsDataURL(file); }
                  }} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-caption font-medium text-secondary uppercase tracking-wider mb-1">Prénom</p>
                    <input value={data.firstName} onChange={(e) => setData((d) => ({ ...d, firstName: e.target.value }))} className={inputClass} placeholder="Votre prénom" />
                  </div>
                  <div>
                    <p className="text-caption font-medium text-secondary uppercase tracking-wider mb-1">Nom</p>
                    <input value={data.lastName} onChange={(e) => setData((d) => ({ ...d, lastName: e.target.value }))} className={inputClass} placeholder="Votre nom" />
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            {STEPS[step].key === "location" && (
              <div className="pt-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cm-green/20 flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-cm-green" />
                </div>
                <h2 className="text-xl font-extrabold">Votre commune</h2>
                <p className="text-xs text-secondary">
                  Choisissez votre commune pour trouver des pros près de chez vous.
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto no-scrollbar">
                  {COMMUNES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setData((d) => ({ ...d, commune: c }))}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        data.commune === c
                          ? "bg-cm-green/10 border-cm-green text-cm-green font-bold"
                          : "bg-white border-pale-mint/30 text-brand-forest hover:border-pale-mint/60"
                      }`}
                    >
                      <MapPin className={`w-4 h-4 mx-auto mb-1 ${data.commune === c ? "text-cm-green" : "text-secondary"}`} />
                      <span className="text-xs font-medium">{c}</span>
                    </button>
                  ))}
                </div>
                <div className="bg-pale-mint p-3 rounded-xl flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cm-green shrink-0" />
                  <span className="text-caption">Activez votre GPS pour une localisation précise</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-8 pt-2">
        {isLast ? (
          <button
            onClick={handleComplete}
            disabled={!canProceed()}
            className="w-full bg-cm-green text-white font-extrabold text-sm py-4 rounded-2xl uppercase tracking-wider hover:brightness-105 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles className="w-4 h-4 inline mr-1.5" /> Commencer
          </button>
        ) : (
          <button
            onClick={next}
            disabled={!canProceed()}
            className="w-full bg-brand-forest text-white font-extrabold text-xs py-4 rounded-2xl uppercase tracking-wider hover:bg-cm-green transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Continuer <ChevronRight className="w-4 h-4 inline ml-1" />
          </button>
        )}
      </div>
    </div>
  );
}

function BenefitTile({ icon: Icon, text }: { icon: ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center gap-3 bg-white p-3 rounded-xl">
      <div className="w-9 h-9 rounded-lg bg-cm-green/20 flex items-center justify-center">
        <Icon className="w-4 h-4 text-cm-green" />
      </div>
      <span className="text-xs font-medium">{text}</span>
    </div>
  );
}
