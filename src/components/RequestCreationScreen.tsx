/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Mic, MicOff, Image as ImageIcon, Sparkles, MapPin, Check, AlertTriangle, Trash2, Play, ChevronRight, DollarSign } from "lucide-react";
import MapView from "./ui/MapView";

export interface AiRequestDetails {
  category: "electricity" | "plumbing" | "ac" | "cleaning";
  subCategory: string;
  urgency: "low" | "medium" | "high" | "emergency";
  estimatedPriceMinXOF: number;
  estimatedPriceMaxXOF: number;
  summary: string;
}

interface RequestCreationScreenProps {
  onBack: () => void;
  onAnalyze: (description: string) => Promise<AiRequestDetails>;
  onProceedToMatching: (details: AiRequestDetails & { address: string; description: string }) => void;
  onSubmit?: (request: {
    title: string;
    description: string;
    photos: string[];
    category: string;
    address: string;
    budgetXOF: number;
    urgency: "immediate" | "today" | "this_week" | "flexible";
  }) => void;
}

const VOICE_SCENARIOS = [
  {
    label: "❄️ Clim en panne (AC)",
    text: "Bonjour, mon climatiseur split dans ma chambre fait un bruit bizarre et ne souffle que de l'air chaud. Il coule aussi un peu d'eau sur le mur. Pouvez-vous envoyer quelqu'un rapidement ?",
  },
  {
    label: "🚿 Fuite sous l'évier (Plombier)",
    text: "Allô, j'ai une grosse fuite d'eau sous l'évier de la cuisine. Le tuyau en plastique semble fissuré et l'eau coule partout. C'est urgent, s'il vous plaît.",
  },
  {
    label: "⚡ Prise grillée (Électricité)",
    text: "Bonjour, j'ai branché mon fer à repasser et ça a fait un grand flash. Maintenant la prise est toute noire et le courant a sauté dans tout le salon.",
  },
  {
    label: "🧹 Ménage de printemps (Nettoyage)",
    text: "Bonjour, je cherche un professionnel pour faire un nettoyage complet et en profondeur de mon appartement de 3 pièces ce samedi matin. Dépoussiérage et lavage des sols.",
  },
];

export default function RequestCreationScreen({ onBack, onAnalyze, onProceedToMatching, onSubmit }: RequestCreationScreenProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Input, 2: AI Loading, 3: Confirmation
  const [description, setDescription] = useState("");
  
  // Voice recording simulation state
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  // Photo uploads state
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // AI loading log states
  const [loadingLogIndex, setLoadingLogIndex] = useState(0);
  const [aiError, setAiError] = useState<string | null>(null);
  const [extractedDetails, setExtractedDetails] = useState<AiRequestDetails | null>(null);
  const [address, setAddress] = useState("Cocody Riviera 3, Abidjan, Côte d'Ivoire");
  const [showMapPicker, setShowMapPicker] = useState(false);

  const loadingLogs = [
    "Transcription du message vocal (Whisper CI)...",
    "Analyse sémantique du besoin par l'IA...",
    "Identification de l'intention & de la catégorie...",
    "Calcul de la fourchette tarifaire dynamique...",
    "Estimation de l'urgence & finalisation...",
  ];

  // Record duration count effect
  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      setRecordTime(0);
    }
    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
    };
  }, [isRecording]);

  // Stagger logs in Step 2
  useEffect(() => {
    if (step === 2) {
      setLoadingLogIndex(0);
      const interval = setInterval(() => {
        setLoadingLogIndex((prev) => {
          if (prev < loadingLogs.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [step]);

  const startVoiceRecording = () => {
    setIsRecording(true);
    setSelectedScenario(null);
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    // Auto populate description if none exists
    if (!description) {
      setDescription("Enregistrement vocal retranscrit : Fuite d'eau détectée dans les sanitaires principaux nécessitant un plombier.");
    }
  };

  const selectScenario = (index: number) => {
    setSelectedScenario(index);
    setDescription(VOICE_SCENARIOS[index].text);
  };

  const handlePhotoCapture = () => {
    const file = photoInputRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) setAttachedPhotos((prev) => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (idx: number) => {
    setAttachedPhotos(attachedPhotos.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;

    setStep(2);
    setAiError(null);

    try {
      const result = await onAnalyze(description);
      setExtractedDetails(result);
      setStep(3);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Erreur de connexion à l'IA Gemini. Veuillez réessayer.");
      setStep(1);
    }
  };

  const handleOverrideCategory = (cat: "electricity" | "plumbing" | "ac" | "cleaning") => {
    if (extractedDetails) {
      setExtractedDetails({
        ...extractedDetails,
        category: cat,
      });
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const [budget, setBudget] = useState("");

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-32">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-brand-cream/90 backdrop-blur-md sticky top-0 z-10">
        <button
          onClick={step === 3 ? () => setStep(1) : onBack}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-8 h-1 rounded-full transition-colors ${s <= step ? "bg-brand-forest" : "bg-pale-mint"}`} />
          ))}
        </div>
        <div className="w-9 h-9" />
      </header>

      {/* Step 1: Input Details */}
      {step === 1 && (
        <main className="px-6 pt-6 flex-grow flex flex-col gap-6">
          <div>
            <h2 className="font-sans text-2xl font-extrabold text-brand-forest tracking-tight">
              Décrivez votre problème
            </h2>
            <p className="text-secondary text-xs mt-1">
              Écrivez ou enregistrez un message vocal en Français ou en Nouchi. Notre IA s'occupe du reste.
            </p>
          </div>

          {/* Text input area */}
          <div className="flex flex-col gap-2 bg-white rounded-3xl p-5 shadow-premium border border-pale-mint/10">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Mon climatiseur split fait de l'air chaud et de l'eau coule sur le mur..."
              className="w-full h-32 text-sm bg-transparent border-none outline-none resize-none text-brand-forest placeholder-secondary/50 font-medium"
            />
            
            {/* Image attachments list */}
            {attachedPhotos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 pt-2 border-t border-pale-mint/10">
                {attachedPhotos.map((photo, index) => (
                  <div key={index} className="relative w-16 h-16 rounded-2xl overflow-hidden border border-pale-mint shrink-0 shadow-sm">
                    <img src={photo} className="w-full h-full object-cover" alt="attachment" />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-brand-forest/80 rounded-full flex items-center justify-center text-brand-lime shadow-sm hover:bg-brand-forest"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input helpers bar */}
            <div className="flex items-center justify-between border-t border-pale-mint/10 pt-4 mt-2">
              <button
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full hover:bg-pale-mint transition-colors text-xs font-bold text-brand-forest cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Ajouter photo ({attachedPhotos.length}/5)</span>
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />

              {isRecording ? (
                <button
                  onClick={stopVoiceRecording}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-red-500 text-white animate-pulse text-xs font-bold cursor-pointer"
                >
                  <MicOff className="w-4 h-4" />
                  <span>{formatTime(recordTime)} • Arrêter</span>
                </button>
              ) : (
                <button
                  onClick={startVoiceRecording}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-pale-mint text-brand-forest hover:bg-pale-mint/70 text-xs font-bold cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>Vocal</span>
                </button>
              )}
            </div>
          </div>

          {/* Voice recorder simulation panel */}
          {isRecording && (
            <div className="bg-brand-forest text-white rounded-3xl p-5 shadow-premium flex flex-col items-center justify-center gap-4 border border-brand-lime/10">
              <div className="flex items-center gap-1 justify-center h-8">
                {/* Simulated sound waves animating */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-brand-lime rounded-full map-pulse"
                    style={{
                      height: `${10 + Math.random() * 25}px`,
                      animationDelay: `${i * 0.25}s`,
                      animationDuration: "0.8s"
                    }}
                  />
                ))}
              </div>
              <p className="text-xs font-bold text-brand-lime tracking-wider uppercase">
                Enregistrement audio en cours...
              </p>
              <p className="text-body-sm text-white/70 italic text-center">
                "Parlez naturellement. Vous pouvez décrire la panne, l'urgence et la commune d'intervention."
              </p>
            </div>
          )}

          {/* Quick Voice Scenarios suggestions */}
          {!isRecording && (
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-forest/65">
                Ou utilisez un exemple type :
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {VOICE_SCENARIOS.map((sc, index) => (
                  <button
                    key={index}
                    onClick={() => selectScenario(index)}
                    className={`p-4 rounded-2xl flex items-center justify-between text-left transition-all border ${
                      selectedScenario === index
                        ? "bg-pale-mint border-brand-lime shadow-sm"
                        : "bg-white border-pale-mint/20 hover:border-pale-mint/50"
                    } cursor-pointer`}
                  >
                    <div>
                      <p className="text-xs font-bold text-brand-forest">{sc.label}</p>
                      <p className="text-body-sm text-secondary line-clamp-1 mt-0.5">{sc.text}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0 text-secondary ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {aiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-2.5 items-start">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{aiError}</p>
            </div>
          )}

          {/* Submit CTA button */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSubmit}
              disabled={!description.trim()}
              className={`w-full py-5 rounded-full flex items-center justify-center gap-2 font-bold text-base shadow-lg transition-all active:scale-[0.98] duration-150 cursor-pointer ${
                description.trim()
                  ? "bg-brand-forest text-white hover:bg-brand-lime hover:text-brand-forest"
                  : "bg-secondary/20 text-secondary/40 cursor-not-allowed shadow-none"
              }`}
            >
              <Sparkles className="w-5 h-5 text-brand-lime" />
              <span>Analyser mon besoin ⚡</span>
            </button>
            {onSubmit && (
              <button
                onClick={() => onSubmit({
                  title: description.slice(0, 60),
                  description,
                  photos: attachedPhotos,
                  category: "ac",
                  address,
                  budgetXOF: 0,
                  urgency: "flexible",
                })}
                disabled={!description.trim()}
                className={`w-full py-4 rounded-full text-sm font-bold border transition-all cursor-pointer active:scale-[0.98] ${
                  description.trim()
                    ? "bg-white border-pale-mint/30 text-brand-forest hover:bg-pale-mint"
                    : "bg-transparent border-pale-mint/10 text-secondary/30 cursor-not-allowed"
                }`}
              >
                Publier sans IA
              </button>
            )}
          </div>
        </main>
      )}

      {/* Step 2: AI Loading Screens */}
      {step === 2 && (
        <main className="px-6 pt-8 flex-grow flex flex-col items-center min-h-[70vh]">
          <div className="relative w-40 h-40 bg-black/5 rounded-full flex items-center justify-center overflow-hidden border border-black/5 mb-6">
            <div className="absolute inset-2 border border-brand-forest/10 rounded-full map-pulse" style={{ animationDelay: "0s" }} />
            <div className="absolute inset-8 border border-brand-forest/10 rounded-full map-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute top-[50%] left-[50%] w-1/2 h-1/2 bg-gradient-to-r from-brand-lime/30 to-transparent radar-sweep border-l border-brand-lime/40 origin-top-left -mt-[0.5px] -ml-[0.5px]" />
            <div className="z-10 bg-white p-4 rounded-full shadow-premium flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-brand-forest animate-pulse" />
            </div>
          </div>

          <div className="w-full text-center space-y-2 mb-6">
            <h3 className="font-sans text-lg font-bold text-brand-forest">Ça Match IA analyse...</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Nous extrayons les détails techniques et tarifaires à partir de votre description.
            </p>
          </div>

          {/* Animated skeleton revealing AI results */}
          <div className="w-full space-y-3">
            {loadingLogIndex >= 0 && (
              <div key={0} className="transition-all duration-500" style={{ opacity: Math.min(1, Math.max(0, loadingLogIndex - 0)) }}>
                <div className="bg-white rounded-2xl p-4 border border-pale-mint/15 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cm-green animate-ping" />
                    <span className="text-xs font-bold text-brand-forest">{loadingLogs[loadingLogIndex]}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="animate-pulse bg-pale-mint/50 h-3 rounded-md w-3/4" />
                    <div className="animate-pulse bg-pale-mint/50 h-3 rounded-md w-1/2" />
                    <div className="animate-pulse bg-pale-mint/50 h-3 rounded-md w-2/3" />
                  </div>
                </div>
              </div>
            )}
            {loadingLogs.slice(0, loadingLogIndex).map((log, index) => (
              <div key={index + 1} className="flex items-center gap-2 text-caption text-secondary/60">
                <Check className="w-3 h-3 text-cm-green shrink-0" />
                <span>{log}</span>
              </div>
            ))}
          </div>

          {/* Skeleton results card — appears mid-analysis */}
          {loadingLogIndex >= 2 && (
            <div className="w-full mt-4 bg-white rounded-3xl p-5 border border-pale-mint/15 space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cm-green" />
                <div className="animate-pulse bg-pale-mint/50 h-4 rounded-md w-1/3" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="animate-pulse bg-pale-mint/50 h-8 rounded-xl" />
                  <div className="animate-pulse bg-pale-mint/50 h-3 rounded-md w-1/2" />
                </div>
                <div className="space-y-2">
                  <div className="animate-pulse bg-pale-mint/50 h-8 rounded-xl" />
                  <div className="animate-pulse bg-pale-mint/50 h-3 rounded-md w-1/2" />
                </div>
              </div>
              <div className="animate-pulse bg-pale-mint/50 h-10 rounded-xl w-full" />
            </div>
          )}
        </main>
      )}

      {/* Step 3: AI Confirmation/Review */}
      {step === 3 && extractedDetails && (
        <main className="px-6 pt-6 flex-grow flex flex-col gap-6">
          <div>
            <h2 className="font-sans text-2xl font-extrabold text-brand-forest tracking-tight">
              Confirmation de l'analyse
            </h2>
            <p className="text-secondary text-xs mt-1">
              Vérifiez les informations détectées par notre IA avant de rechercher les professionnels.
            </p>
          </div>

          {/* AI Result Card */}
          <div className="bg-white rounded-3xl p-5 shadow-premium border border-pale-mint/15 space-y-5">
            {/* Summary */}
            <div className="bg-pale-mint/20 p-4 rounded-2xl border border-pale-mint/15 text-xs text-brand-forest leading-relaxed">
              <span className="font-bold text-caption uppercase text-brand-forest tracking-wider block mb-1">Résumé du besoin :</span>
              "{extractedDetails.summary}"
            </div>

            {/* Category selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-caption font-extrabold uppercase text-secondary tracking-wider">Catégorie détectée</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "electricity", label: "⚡ Électricité" },
                  { id: "plumbing", label: "🚿 Plomberie" },
                  { id: "ac", label: "❄️ Climatisation" },
                  { id: "cleaning", label: "🧹 Ménage" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleOverrideCategory(cat.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer ${
                      extractedDetails.category === cat.id
                        ? "bg-brand-forest text-white border-brand-forest"
                        : "bg-white border-pale-mint/30 text-brand-forest hover:shadow-sm"
                    }`}
                  >
                    <span className="text-lg">{cat.label.split(" ")[0]}</span>
                    <p className="text-xs font-bold mt-1">{cat.label.replace(/^[^\s]+\s/, "")}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Urgency selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-caption font-extrabold uppercase text-secondary tracking-wider">Urgence</label>
                <div className={`py-3 px-4 rounded-xl font-extrabold text-xs text-center border capitalize ${
                  extractedDetails.urgency === "emergency" ? "bg-red-50 text-red-700 border-red-200" :
                  extractedDetails.urgency === "high" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  extractedDetails.urgency === "medium" ? "bg-blue-50 text-blue-700 border-blue-200" :
                  "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  {extractedDetails.urgency === "emergency" && "🚨 Critique / SOS"}
                  {extractedDetails.urgency === "high" && "🔥 Élevée"}
                  {extractedDetails.urgency === "medium" && "⚡ Moyenne"}
                  {extractedDetails.urgency === "low" && "🟢 Faible"}
                </div>
              </div>

              {/* Specific detail subCategory */}
              <div className="flex flex-col gap-1.5">
                <label className="text-caption font-extrabold uppercase text-secondary tracking-wider">Sous-type</label>
                <div className="py-3 px-4 rounded-xl font-bold text-xs text-center border border-pale-mint text-brand-forest truncate bg-cloud">
                  {extractedDetails.subCategory}
                </div>
              </div>
            </div>

            {/* Price Estimate range display */}
            <div className="border-t border-pale-mint/15 pt-4">
              <label className="text-caption font-extrabold uppercase text-secondary tracking-wider block mb-1">Fourchette estimée (IA)</label>
              <div className="flex justify-between items-baseline">
                <div className="flex items-baseline gap-1">
                  <span className="font-sans text-2xl font-extrabold text-brand-forest">
                    {extractedDetails.estimatedPriceMinXOF.toLocaleString("fr-FR")} - {extractedDetails.estimatedPriceMaxXOF.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-sm font-bold text-brand-forest">F CFA</span>
                </div>
                <span className="bg-brand-lime/20 text-brand-forest text-caption font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Main d'œuvre
                </span>
              </div>
              <p className="text-caption text-secondary mt-1 font-medium">
                * Marge hors pièces de rechange et déplacement (+5 000 F).
              </p>
            </div>

            {/* Address input */}
            <div className="border-t border-pale-mint/15 pt-4 flex flex-col gap-1.5">
              <label className="text-caption font-extrabold uppercase text-secondary tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-forest" /> Lieu de l'intervention
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-11 px-4 text-xs font-bold border border-pale-mint rounded-xl text-brand-forest outline-none focus:ring-1 focus:ring-brand-forest"
              />
              <button onClick={() => setShowMapPicker(true)}
                className="flex items-center gap-1 text-caption text-cm-green font-medium cursor-pointer hover:underline">
                <MapPin className="w-3 h-3" /> Choisir sur la carte
              </button>
            </div>

            {/* Map Picker Modal */}
            {showMapPicker && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={() => setShowMapPicker(false)}>
                <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <div className="p-4 flex items-center justify-between border-b border-pale-mint/10">
                    <h3 className="text-sm font-bold">Choisir un lieu</h3>
                    <button onClick={() => setShowMapPicker(false)} className="w-10 h-10 rounded-full bg-pale-mint flex items-center justify-center cursor-pointer">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                  <MapView
                    height="h-72"
                    interactive
                    onMapClick={(lat, lng) => {
                      setAddress(`Position: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                      setShowMapPicker(false);
                    }}
                  />
                  <div className="p-4 text-center">
                    <p className="text-caption text-secondary">Touchez un endroit sur la carte pour le sélectionner</p>
                  </div>
                </div>
              </div>
            )}

            {/* Budget */}
            <div className="border-t border-pale-mint/15 pt-4 flex flex-col gap-1.5">
              <label className="text-caption font-extrabold uppercase text-secondary tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Budget proposé (FCFA)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Montant max (optionnel)"
                className="w-full h-11 px-4 text-xs font-bold border border-pale-mint rounded-xl text-brand-forest outline-none focus:ring-1 focus:ring-brand-forest"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Confirm match button */}
            <button
              onClick={() => onProceedToMatching({ ...extractedDetails, address, description })}
              className="w-full py-5 bg-brand-lime text-brand-forest font-bold text-base rounded-full shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] duration-150 group"
            >
              <span>Lancer la recherche de Pro ➔</span>
            </button>
            {onSubmit && (
              <button
                onClick={() => onSubmit({
                  title: extractedDetails.summary.slice(0, 60),
                  description: `${extractedDetails.summary}\n\n${description}`,
                  photos: attachedPhotos,
                  category: extractedDetails.category,
                  address,
                  budgetXOF: parseInt(budget) || 0,
                  urgency: extractedDetails.urgency === "emergency" ? "immediate" : extractedDetails.urgency === "high" ? "today" : extractedDetails.urgency === "medium" ? "this_week" : "flexible",
                })}
                className="w-full py-4 bg-white border border-pale-mint/30 text-brand-forest font-bold text-sm rounded-full hover:bg-pale-mint transition-all cursor-pointer active:scale-[0.98]"
              >
                Publier directement
              </button>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
