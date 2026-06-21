import { useState, useRef, type ComponentType, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, Check, Camera, MapPin, DollarSign,
  Smartphone, UserIcon, Shield, Star, Clock, Upload, Navigation,
  Briefcase, Sparkles,
} from "lucide-react";
import { OnboardingStep, OnboardingData } from "../types";

interface Props {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
}

const STEPS: { key: OnboardingStep; label: string }[] = [
  { key: "welcome", label: "Bienvenue" },
  { key: "phone", label: "Téléphone" },
  { key: "basic-info", label: "Infos" },
  { key: "service-area", label: "Zone" },
  { key: "pricing", label: "Tarifs" },
  { key: "photo", label: "Photo" },
  { key: "verification", label: "Vérification" },
];

const CATEGORIES = [
  { id: "electricity", label: "Électricien", icon: Briefcase },
  { id: "plumbing", label: "Plombier", icon: Briefcase },
  { id: "ac", label: "Climatisation", icon: Briefcase },
  { id: "cleaning", label: "Ménage/Nettoyage", icon: Briefcase },
];

export default function ProOnboardingScreen({ onComplete, onSkip }: Props) {
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [data, setData] = useState<OnboardingData>({
    firstName: "", lastName: "", category: "", phone: "",
    serviceRadiusKm: 10, locationLat: 5.36, locationLng: -4.01,
    hourlyRateXOF: 10000, travelFeeXOF: 5000,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [verificationDone, setVerificationDone] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;
  const isLast = step === "verification";

  const next = () => {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key);
  };
  const prev = () => {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx > 0) setStep(STEPS[idx - 1].key);
  };

  const canProceed = () => {
    switch (step) {
      case "basic-info": return data.firstName && data.lastName && data.category;
      case "phone": return data.phone.length >= 8;
      case "pricing": return data.hourlyRateXOF >= 5000;
      case "verification": return verificationDone;
      default: return true;
    }
  };

  const handleComplete = () => {
    onComplete({ ...data, avatarLocalUrl: photoPreview || undefined });
  };

  const inputClass = "w-full h-11 text-sm bg-pale-mint/30 rounded-xl px-4 outline-none focus:ring-1 focus:ring-brand-lime";

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      {/* Top Progress Bar */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between mb-2">
          <button onClick={stepIndex > 0 ? prev : onSkip} className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer">
            <ChevronLeft className="w-5 h-5 text-brand-forest" />
          </button>
          <span className="text-caption font-medium text-secondary">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-pale-mint rounded-full overflow-hidden">
          <div className="h-full bg-brand-lime rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-caption text-secondary mt-2 font-medium uppercase tracking-wider">
          {STEPS[stepIndex]?.label}
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
            {step === "welcome" && (
              <div className="flex flex-col items-center pt-8 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-brand-lime flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-brand-forest" />
                </div>
                <h1 className="text-2xl font-extrabold">Devenez Prestataire</h1>
                <p className="text-sm text-secondary max-w-xs leading-relaxed">
                  Rejoignez Ça Match et connectez-vous avec des clients à Abidjan. Fixez vos tarifs, gérez votre planning et développez votre activité.
                </p>
                <div className="space-y-2 w-full pt-4">
                  <BenefitTile icon={DollarSign} text="Gagnez jusqu'à 500 000 F/mois" />
                  <BenefitTile icon={Clock} text="Gérez votre planning librement" />
                  <BenefitTile icon={Star} text="Soyez noté par vos clients" />
                  <BenefitTile icon={Shield} text="Paiements sécurisés Mobile Money" />
                </div>
              </div>
            )}

            {/* Phone */}
            {step === "phone" && (
              <div className="pt-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-lime/20 flex items-center justify-center">
                  <Smartphone className="w-7 h-7 text-brand-forest" />
                </div>
                <h2 className="text-xl font-extrabold">Votre numéro</h2>
                <p className="text-xs text-secondary">Saisissez votre numéro WhatsApp pour recevoir les missions.</p>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-pale-mint/30">
                  <span className="text-sm font-bold px-3 py-2 bg-pale-mint rounded-lg">+225</span>
                  <input
                    type="tel" inputMode="numeric" placeholder="XX XX XX XX"
                    value={data.phone} onChange={(e) => setData((d) => ({ ...d, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                    className="flex-1 text-sm outline-none bg-transparent"
                  />
                </div>
              </div>
            )}

            {/* Basic Info */}
            {step === "basic-info" && (
              <div className="pt-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-lime/20 flex items-center justify-center">
                  <UserIcon className="w-7 h-7 text-brand-forest" />
                </div>
                <h2 className="text-xl font-extrabold">Qui êtes-vous ?</h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div><p className="text-caption font-medium text-secondary uppercase tracking-wider mb-1">Prénom</p><input value={data.firstName} onChange={(e) => setData((d) => ({ ...d, firstName: e.target.value }))} className={inputClass} placeholder="Jean" /></div>
                    <div><p className="text-caption font-medium text-secondary uppercase tracking-wider mb-1">Nom</p><input value={data.lastName} onChange={(e) => setData((d) => ({ ...d, lastName: e.target.value }))} className={inputClass} placeholder="Kouamé" /></div>
                  </div>
                  <div>
                    <p className="text-caption font-medium text-secondary uppercase tracking-wider mb-2">Métier</p>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setData((d) => ({ ...d, category: cat.id }))}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${data.category === cat.id ? "bg-brand-lime/20 border-brand-lime" : "bg-white border-pale-mint/30"}`}
                        >
                          <cat.icon className="w-5 h-5 mx-auto mb-1 text-brand-forest" />
                          <span className="text-caption font-medium">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Service Area */}
            {step === "service-area" && (
              <div className="pt-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-lime/20 flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-brand-forest" />
                </div>
                <h2 className="text-xl font-extrabold">Zone d'intervention</h2>
                <p className="text-xs text-secondary">Définissez votre rayon d'action autour de Cocody, Abidjan.</p>
                <div className="bg-white p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-lime" />
                    <span className="text-xs font-bold">Cocody, Abidjan</span>
                  </div>
                  <div>
                    <p className="text-caption font-medium text-secondary mb-2">Rayon : {data.serviceRadiusKm} km</p>
                    <input type="range" min="1" max="30" value={data.serviceRadiusKm} onChange={(e) => setData((d) => ({ ...d, serviceRadiusKm: parseInt(e.target.value) }))} className="w-full accent-brand-lime" />
                    <div className="flex justify-between text-caption text-secondary mt-1"><span>1 km</span><span>15 km</span><span>30 km</span></div>
                  </div>
                  <div className="bg-pale-mint p-3 rounded-xl">
                    <Navigation className="w-4 h-4 text-brand-forest inline mr-1" />
                    <span className="text-caption">La localisation précise sera activée via le GPS de votre téléphone.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing */}
            {step === "pricing" && (
              <div className="pt-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-lime/20 flex items-center justify-center">
                  <DollarSign className="w-7 h-7 text-brand-forest" />
                </div>
                <h2 className="text-xl font-extrabold">Vos tarifs</h2>
                <p className="text-xs text-secondary">Fixez vos prix. Vous pourrez les modifier plus tard.</p>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-2xl">
                    <p className="text-caption font-medium text-secondary uppercase tracking-wider mb-1">Taux horaire</p>
                    <div className="flex items-center gap-2"><input type="number" value={data.hourlyRateXOF} onChange={(e) => setData((d) => ({ ...d, hourlyRateXOF: parseInt(e.target.value) || 0 }))} className="text-2xl font-extrabold bg-transparent outline-none w-full" min="5000" /><span className="text-xs font-bold text-secondary">F / heure</span></div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl">
                    <p className="text-caption font-medium text-secondary uppercase tracking-wider mb-1">Frais de déplacement</p>
                    <div className="flex items-center gap-2"><input type="number" value={data.travelFeeXOF} onChange={(e) => setData((d) => ({ ...d, travelFeeXOF: parseInt(e.target.value) || 0 }))} className="text-2xl font-extrabold bg-transparent outline-none w-full" min="0" /><span className="text-xs font-bold text-secondary">F</span></div>
                  </div>
                </div>
                <div className="bg-brand-forest text-white p-4 rounded-2xl flex items-center justify-between">
                  <span className="text-xs">Exemple (2h + déplacement)</span>
                  <span className="text-lg font-extrabold text-brand-lime">{(data.hourlyRateXOF * 2 + data.travelFeeXOF).toLocaleString()} F</span>
                </div>
              </div>
            )}

            {/* Photo */}
            {step === "photo" && (
              <div className="pt-6 space-y-4 text-center">
                <div
                  onClick={() => photoRef.current?.click()}
                  className="cursor-pointer mx-auto"
                >
                  {photoPreview ? (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto border-4 border-brand-lime">
                      <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-pale-mint border-2 border-dashed border-gray-300 flex flex-col items-center justify-center mx-auto hover:border-brand-lime transition-colors">
                      <Camera className="w-8 h-8 text-secondary/60 mb-1" />
                      <p className="text-caption text-secondary/60">Ajouter une photo</p>
                    </div>
                  )}
                </div>
                <input ref={photoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { const r = new FileReader(); r.onload = () => setPhotoPreview(r.result as string); r.readAsDataURL(file); }
                }} />
                <h2 className="text-xl font-extrabold">Photo de profil</h2>
                <p className="text-xs text-secondary max-w-xs mx-auto">
                  Ajoutez une photo professionnelle. Les prestataires avec photo reçoivent 2× plus de missions.
                </p>
              </div>
            )}

            {/* Verification */}
            {step === "verification" && (
              <div className="pt-6 space-y-4 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${verificationDone ? "bg-brand-lime" : "bg-amber-100"}`}>
                  {verificationDone ? <Check className="w-8 h-8 text-brand-forest" /> : <Shield className="w-8 h-8 text-amber-600" />}
                </div>
                <h2 className="text-xl font-extrabold">Vérification d'identité</h2>
                <p className="text-xs text-secondary max-w-xs mx-auto">
                  Pour garantir la confiance, nous vérifions votre identité via votre CNI ou passeport. Le processus prend 24-48h.
                </p>
                <button
                  onClick={() => setVerificationDone(true)}
                  className={`w-full py-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${verificationDone ? "bg-brand-lime text-brand-forest" : "bg-amber-500 text-white hover:bg-amber-600"}`}
                >
                  {verificationDone ? (
                    <><Check className="w-4 h-4 inline mr-1.5" /> Vérification demandée</>
                  ) : (
                    <>Soumettre ma pièce d'identité</>
                  )}
                </button>
                {verificationDone && (
                  <div className="bg-amber-50 p-4 rounded-2xl">
                    <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                    <p className="text-xs text-amber-700 font-medium">Vérification en cours (24-48h). Vous pouvez déjà utiliser l'application en mode limité.</p>
                  </div>
                )}
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
            className="w-full bg-brand-forest text-white font-extrabold text-xs py-4 rounded-2xl uppercase tracking-wider hover:bg-brand-lime hover:text-brand-forest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles className="w-4 h-4 inline mr-1.5" /> Commencer l'aventure
          </button>
        ) : (
          <button
            onClick={next}
            disabled={!canProceed()}
            className="w-full bg-brand-forest text-white font-extrabold text-xs py-4 rounded-2xl uppercase tracking-wider hover:bg-brand-lime hover:text-brand-forest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
      <div className="w-9 h-9 rounded-lg bg-brand-lime/20 flex items-center justify-center"><Icon className="w-4 h-4 text-brand-forest" /></div>
      <span className="text-xs font-medium">{text}</span>
    </div>
  );
}
