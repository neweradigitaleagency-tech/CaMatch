"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Camera, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const ZONES = [
  "Cocody", "Yopougon", "Marcory", "Abobo",
  "Plateau", "Treichville", "Adjamé", "Port-Bouët", "Autre"
];

const CATEGORIES = [
  "Électricien", "Plombier", "Menuisier", "Ménage",
  "Réparation téléphone", "Prof à domicile", "Climatisation",
  "Coiffure", "Photographie", "Informatique"
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"client" | "pro" | null>(null);
  const [fullName, setFullName] = useState("");
  const [zone, setZone] = useState("");
  const [category, setCategory] = useState("");
  const [bio, setBio] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleNext = () => {
    if (step === 1 && !role) return;
    if (step === 2) {
      if (!fullName.trim()) { setError("Veuillez entrer votre nom complet"); return; }
      if (!zone) { setError("Veuillez sélectionner votre zone"); return; }
      if (role === "pro") {
        if (!category) { setError("Veuillez sélectionner votre catégorie"); return; }
        if (bio.length > 160) { setError("La bio ne peut pas dépasser 160 caractères"); return; }
      }
      setError("");
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleConfirm = async () => {
    setSaving(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const profileData: Record<string, unknown> = {
        firstName,
        lastName,
        zone: [zone],
        onboardingCompleted: true,
      };

      if (role === "pro") {
        profileData.category = category;
        profileData.bio = bio;
        profileData.priceMin = priceMin ? parseInt(priceMin) : null;
        profileData.priceMax = priceMax ? parseInt(priceMax) : null;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          role: role === "pro" ? "PROFESSIONAL" : "CLIENT",
          profile: profileData,
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");

      router.push(role === "pro" ? `/pro/${user.id}` : "/search");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-4">
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} className="btn-ghost p-2 -ml-2">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-text-tertiary">{step}/3</span>
        </div>
      </div>

      <div className="flex-1 px-4 pb-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center pt-4">
                <h1 className="text-2xl font-extrabold text-text-primary mb-2">
                  Bienvenue sur Ça Match
                </h1>
                <p className="text-sm text-text-secondary">
                  Pour commencer, dites-nous qui vous êtes
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <button
                  onClick={() => { setRole("client"); setTimeout(() => handleNext(), 300); }}
                  className={cn(
                    "w-full text-left p-6 rounded-2xl border-2 transition-all duration-200",
                    role === "client"
                      ? "border-primary bg-primary-50"
                      : "border-gray-200 bg-white hover:border-primary/30"
                  )}
                >
                  <div className="text-3xl mb-3">🔍</div>
                  <h3 className="text-lg font-bold text-text-primary">Je cherche un professionnel</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Trouvez rapidement un artisan ou prestataire fiable près de chez vous.
                  </p>
                </button>

                <button
                  onClick={() => { setRole("pro"); setTimeout(() => handleNext(), 300); }}
                  className={cn(
                    "w-full text-left p-6 rounded-2xl border-2 transition-all duration-200",
                    role === "pro"
                      ? "border-primary bg-primary-50"
                      : "border-gray-200 bg-white hover:border-primary/30"
                  )}
                >
                  <div className="text-3xl mb-3">🛠️</div>
                  <h3 className="text-lg font-bold text-text-primary">Je suis professionnel</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Développez votre clientèle et construisez votre réputation numérique.
                  </p>
                </button>
              </div>

              <button
                onClick={handleNext}
                disabled={!role}
                className="w-full bg-primary text-white font-bold rounded-2xl py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 shadow-card"
              >
                Continuer
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5 pt-4"
            >
              <h1 className="text-xl font-extrabold text-text-primary">Vos informations</h1>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">Nom complet *</label>
                <input
                  type="text"
                  placeholder="Votre nom et prénom"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">Photo de profil</label>
                <button className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-2xl text-text-secondary hover:border-primary/30 transition-colors">
                  <Camera className="w-5 h-5" />
                  <span className="text-sm">Ajouter une photo (optionnel)</span>
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">Quartier / Zone *</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="input-field"
                >
                  <option value="">Sélectionnez votre zone</option>
                  {ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              {role === "pro" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-text-primary mb-1.5 block">Catégorie de service *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Sélectionnez votre métier</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-primary mb-1.5 block">
                      Bio <span className="text-text-tertiary font-normal">({bio.length}/160 max)</span>
                    </label>
                    <textarea
                      placeholder="Ex: Électricien avec 8 ans d'expérience à Abidjan. Intervention rapide, devis gratuit."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={160}
                      rows={3}
                      className="input-field resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-primary mb-1.5 block">Tarif indicatif (FCFA)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        className="input-field flex-1"
                      />
                      <span className="text-text-tertiary">—</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        className="input-field flex-1"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={handleNext}
                className="w-full bg-primary text-white font-bold rounded-2xl py-4 text-lg active:scale-[0.98] transition-all duration-200 shadow-card"
              >
                Continuer
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pt-4"
            >
              <h1 className="text-xl font-extrabold text-text-primary">Récapitulatif</h1>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Rôle</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {role === "client" ? "👤 Client" : "🛠️ Professionnel"}
                  </span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Nom</span>
                  <span className="text-sm font-semibold text-text-primary">{fullName}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Zone</span>
                  <span className="text-sm font-semibold text-text-primary">{zone}</span>
                </div>
                {role === "pro" && (
                  <>
                    <div className="h-px bg-gray-200" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">Métier</span>
                      <span className="text-sm font-semibold text-text-primary">{category}</span>
                    </div>
                    {bio && (
                      <>
                        <div className="h-px bg-gray-200" />
                        <div>
                          <span className="text-sm text-text-secondary block mb-1">Bio</span>
                          <p className="text-sm font-semibold text-text-primary">{bio}</p>
                        </div>
                      </>
                    )}
                    {(priceMin || priceMax) && (
                      <>
                        <div className="h-px bg-gray-200" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Tarif</span>
                          <span className="text-sm font-semibold text-text-primary">
                            {priceMin ? `${parseInt(priceMin).toLocaleString()} FCFA` : "—"} {priceMax ? `- ${parseInt(priceMax).toLocaleString()} FCFA` : ""}
                          </span>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              <button
                onClick={handleConfirm}
                disabled={saving}
                className="w-full bg-primary text-white font-bold rounded-2xl py-4 text-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-card flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                {saving ? "Enregistrement..." : role === "client" ? "Trouver mon premier pro →" : "Voir mon profil public →"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}